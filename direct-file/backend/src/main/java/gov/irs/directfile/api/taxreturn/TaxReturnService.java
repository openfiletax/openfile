package gov.irs.directfile.api.taxreturn;

import java.lang.reflect.InvocationTargetException;
import java.net.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.BooleanNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.MDC;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import gov.irs.factgraph.Graph;
import gov.irs.factgraph.monads.Result;

import gov.irs.directfile.api.audit.AuditLogElement;
import gov.irs.directfile.api.audit.AuditService;
import gov.irs.directfile.api.config.StatusEndpointProperties;
import gov.irs.directfile.api.dataimport.gating.DataImportBehavior;
import gov.irs.directfile.api.dataimport.gating.DataImportGatingService;
import gov.irs.directfile.api.dispatch.DispatchContext;
import gov.irs.directfile.api.dispatch.DispatchService;
import gov.irs.directfile.api.errors.*;
import gov.irs.directfile.api.events.XXXCode;
import gov.irs.directfile.api.loaders.domain.GraphGetResult;
import gov.irs.directfile.api.loaders.errors.FactGraphSaveException;
import gov.irs.directfile.api.loaders.service.FactGraphService;
import gov.irs.directfile.api.taxreturn.dto.Status;
import gov.irs.directfile.api.taxreturn.dto.StatusResponseBody;
import gov.irs.directfile.api.taxreturn.dto.TaxReturnAndSubmission;
import gov.irs.directfile.api.taxreturn.models.SubmissionEvent;
import gov.irs.directfile.api.taxreturn.models.TaxReturn;
import gov.irs.directfile.api.taxreturn.models.TaxReturnSubmission;
import gov.irs.directfile.api.taxreturn.submissions.SendEmailQueueService;
import gov.irs.directfile.api.taxreturn.submissions.lock.AdvisoryLockRepository;
import gov.irs.directfile.api.user.UserService;
import gov.irs.directfile.api.user.domain.UserInfo;
import gov.irs.directfile.api.user.models.User;
import gov.irs.directfile.models.*;
import gov.irs.directfile.models.email.HtmlTemplate;
import gov.irs.directfile.models.message.SendEmailQueueMessageBody;
import gov.irs.directfile.models.message.SubmissionEventFailureCategoryEnum;
import gov.irs.directfile.models.message.SubmissionEventFailureDetailEnum;
import gov.irs.directfile.models.message.event.SubmissionEventTypeEnum;

@Service
@Slf4j
@SuppressWarnings({
    "PMD.CloseResource",
    "PMD.ExcessiveParameterList",
    "PMD.UnusedPrivateMethod",
    "PMD.UnusedFormalParameter",
    "PMD.SignatureDeclareThrowsException",
    "PMD.AvoidReassigningParameters",
    "PMD.UnnecessaryReturn"
})
public class TaxReturnService {
    private static final Duration REST_CLIENT_TIMEOUT = Duration.ofSeconds(5);
    public static final String UTC_TIMEZONE_NAME = "UTC";
    private final TaxReturnRepository taxReturnRepo;
    private final TaxReturnSubmissionRepository taxReturnSubmissionRepo;
    private final AuditService auditService;
    private final UserService userService;
    private final DispatchService dispatchService;
    private final FactGraphService factGraphService;
    private final RestClient restClient;
    private final StatusEndpointProperties statusEndpointProperties;
    private final SendEmailQueueService sendEmailQueueService;
    private final SubmissionEventRepository submissionEventRepository;
    private final AdvisoryLockRepository advisoryLockRepository;
    private final DataImportGatingService dataImportGatingService;

    private final Clock systemClock;
    private static final String SYSTEM_TIME_DATE_PATTERN = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    // If unable to find /offset fact, default to Eastern Time
    private static final int DEFAULT_UTC_TIMEZONE_OFFSET = -4;
    public static final String SYSTEM_TIMESTAMP_PATTERN = "uuuu-MM-dd'T'HH:mm:ssXXX";

    public static final int MINUTES_IN_AN_HOUR = 60;

    private static final String PREVIEW_RETURN = "previewReturn";
    private static final String FILING_STATUS_IS_MFJ_WITH_LIVING_SPOUSE = "/isMFJWithLivingSpouse";

    private final StatusResponseBodyCacheService statusResponseBodyCacheService;

    public TaxReturnService(
            final AuditService auditService,
            final TaxReturnRepository taxReturnRepo,
            final TaxReturnSubmissionRepository taxReturnSubmissionRepo,
            final UserService userService,
            final DispatchService dispatchService,
            final FactGraphService factGraphService,
            final RestClient.Builder restClientBuilder,
            final StatusEndpointProperties statusEndpointProperties,
            final SendEmailQueueService sendEmailQueueService,
            final SubmissionEventRepository submissionEventRepository,
            final Clock systemClock,
            final AdvisoryLockRepository advisoryLockRepository,
            final StatusResponseBodyCacheService statusResponseBodyCacheService,
            final DataImportGatingService dataImportGatingService) {
        this.auditService = auditService;
        this.taxReturnRepo = taxReturnRepo;
        this.taxReturnSubmissionRepo = taxReturnSubmissionRepo;
        this.userService = userService;
        this.dispatchService = dispatchService;
        this.factGraphService = factGraphService;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(REST_CLIENT_TIMEOUT);
        this.restClient = restClientBuilder.requestFactory(requestFactory).build();

        this.statusEndpointProperties = statusEndpointProperties;
        this.sendEmailQueueService = sendEmailQueueService;
        this.submissionEventRepository = submissionEventRepository;
        this.systemClock = systemClock;
        this.advisoryLockRepository = advisoryLockRepository;
        this.statusResponseBodyCacheService = statusResponseBodyCacheService;
        this.dataImportGatingService = dataImportGatingService;
    }

    @Transactional(readOnly = true)
    public List<TaxReturn> findByUserId(UUID userId) {
        return taxReturnRepo.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Optional<TaxReturn> findByIdAndUserId(UUID taxReturnId, UUID userId) {
        MDC.put(AuditLogElement.TAX_RETURN_ID.toString(), taxReturnId.toString());
        auditService.addEventProperty(AuditLogElement.XXX_CODE, XXXCode.XXX_CODE);

        Optional<TaxReturn> optTaxReturn = taxReturnRepo.findByIdAndUserId(taxReturnId, userId);
        if (optTaxReturn.isEmpty()) {
            userId = userService.getOrCreateUserDev().get().getId();
            optTaxReturn = taxReturnRepo.findByIdAndUserId(taxReturnId, userId);
        }
        if (optTaxReturn.isPresent()) {
            // attempt to add audit properties
            TaxReturn taxReturn = optTaxReturn.get();
            addTaxPeriodToAuditLog(taxReturn.getTaxYear());
        }

        // retain previous interface so callers can handle presence themselves
        return optTaxReturn;
    }

    /**
     * A TaxReturn is considered editable if either of the following conditions are met:
     * <p>
     * 1. The most recent SubmissionEvent of the most recent TaxReturnSubmission of the TaxReturn has an event_type (status) of "rejected"
     * AND only one such SubmissionEvent exists.
     * </p>
     * 2. No SubmissionEvents exist whatsoever for the most recent TaxReturnSubmission.
     * This can only occur if no TaxReturnSubmission exists because the first SubmissionEvent of a given TaxReturnSubmission
     * are created within the same transaction.
     */
    @Transactional(readOnly = true)
    protected boolean isTaxReturnEditable(UUID taxReturnId) {
        Optional<Boolean> isEditableOpt = taxReturnSubmissionRepo.isTaxReturnEditable(taxReturnId);
        // This optional not being present represents no submissions, so the tax return is editable
        return isEditableOpt.orElse(true);
    }

    @Transactional
    protected void saveTaxReturnSubmission(TaxReturnSubmission taxReturnSubmission) {
        taxReturnSubmissionRepo.save(taxReturnSubmission);
    }

    @Transactional
    protected void saveTaxReturn(TaxReturn taxReturn) {
        taxReturnRepo.save(taxReturn);
    }

    @Transactional(readOnly = true)
    public List<TaxReturnSubmission> findTaxReturnSubmissionsForAPIResponse(UUID taxReturnId) {
        return taxReturnSubmissionRepo.findAllTaxReturnSubmissionsByTaxReturnId(taxReturnId);
    }

    @Transactional
    public TaxReturn create(
            int taxYear,
            Map<String, FactTypeWithItem> facts,
            UUID _userId,
            String loggedInEmail,
            String tin,
            String address,
            int port,
            String userAgent)
            throws InvalidOperationException, InvocationTargetException, NoSuchMethodException, IllegalAccessException,
                    UnknownHostException {

        UUID userId = _userId;
        addTaxPeriodToAuditLog(taxYear);
        auditService.addEventProperty(AuditLogElement.XXX_CODE, XXXCode.XXX_CODE);
        Optional<TaxReturn> existingTaxReturn = taxReturnRepo.findByUserIdAndTaxYear(userId, taxYear);

        if (existingTaxReturn.isPresent()) {
            log.error("Cannot create tax return for user: {}. Tax Return already exists", userId);

            throw new InvalidOperationException(String.format("Tax return already exists for user %s.", userId));
        }
        Optional<User> user = userService.getOrCreateUserDev();
        if (user.isEmpty()) {
            log.error("Cannot create tax return for user: {}. No user found for provided id.", userId);
            throw new InvalidDataException(String.format("No user found for user %s", userId));
        }
        addEmailAndTinToFactGraph(userId, facts, loggedInEmail, tin);
        if (!factGraphService.factsParseCorrectly(facts)) {
            String message =
                    String.format("Facts did not parse correctly, cannot create tax return for user: %s.", userId);
            log.error(message);

            throw new FactGraphParseResponseStatusException(message);
        }

        DataImportBehavior behavior = dataImportGatingService.getBehavior(loggedInEmail);
        auditService.addEventProperty(AuditLogElement.DATA_IMPORT_BEHAVIOR, behavior.name());

        TaxReturn taxReturn = new TaxReturn();
        taxReturn.setTaxYear(taxYear);
        taxReturn.setFacts(facts);
        taxReturn.addOwner(user.get());
        taxReturn.setDataImportBehavior(behavior.name());

        taxReturn = taxReturnRepo.save(taxReturn);
        MDC.put(AuditLogElement.TAX_RETURN_ID.toString(), taxReturn.getId().toString());

        return taxReturn;
    }

    private void addEmailAndTinToFactGraph(UUID userId, Map<String, FactTypeWithItem> facts, String email, String tin) {
        ObjectNode emailNode = JsonNodeFactory.instance.objectNode();
        emailNode.put("email", email);
        facts.put("/email", new FactTypeWithItem("gov.irs.factgraph.persisters.EmailAddressWrapper", emailNode));

        String cleanedTin = tin.replace("-", "");
        if (cleanedTin.length() != 9) {
            log.error("Invalid TIN for user {}", userId);

            throw new InvalidDataException(String.format("Invalid TIN for user %s", userId));
        }
        ObjectNode tinNode = JsonNodeFactory.instance.objectNode();
        tinNode.put("area", cleanedTin.substring(0, 3));
        tinNode.put("group", cleanedTin.substring(3, 5));
        tinNode.put("serial", cleanedTin.substring(5, 9));

        String primaryFilerId = UUID.randomUUID().toString();
        String secondaryFilerId = UUID.randomUUID().toString();
        facts.put(
                "/filers/#" + primaryFilerId + "/tin",
                new FactTypeWithItem("gov.irs.factgraph.persisters.TinWrapper", tinNode));

        ArrayList<JsonNode> filersArray = new ArrayList<>();
        JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(false);
        filersArray.add(jsonNodeFactory.textNode(primaryFilerId));
        filersArray.add(jsonNodeFactory.textNode(secondaryFilerId));
        facts.put(
                "/filers",
                new FactTypeWithItem(
                        "gov.irs.factgraph.persisters.CollectionWrapper",
                        new ObjectNode(
                                jsonNodeFactory, Map.of("items", new ArrayNode(jsonNodeFactory, filersArray)))));
        facts.put(
                "/filers/#" + primaryFilerId + "/isPrimaryFiler",
                new FactTypeWithItem("gov.irs.factgraph.persisters.BooleanWrapper", BooleanNode.getTrue()));
        facts.put(
                "/filers/#" + secondaryFilerId + "/isPrimaryFiler",
                new FactTypeWithItem("gov.irs.factgraph.persisters.BooleanWrapper", BooleanNode.getFalse()));
    }

    /*
     * The UI sends the timezone offset in minutes based on the JS Docs:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
     *
     * The value is POSITIVE for timezones behind UTC and NEGATIVE for timezones ahead of UTC.
     * Java is the opposite. NEGATIVE for timezones behind UTC and POSITIVE for timezones ahead of UTC.
     *
     * Example EDT = 240 (UTC -4), whereas Abu Dhabi (UTC + 4) is -240
     *
     * Additionally, we convert to hours because that's what the constructor expects.
     */
    public static String getFormattedSystemTimestampForOffset(int offsetInMinutes, Instant instant) {

        int zoneOffset = -1 * (offsetInMinutes / MINUTES_IN_AN_HOUR);
        final ZonedDateTime currentDate =
                ZonedDateTime.ofInstant(instant, ZoneId.ofOffset(UTC_TIMEZONE_NAME, ZoneOffset.ofHours(zoneOffset)));
        return currentDate.format(DateTimeFormatter.ofPattern(SYSTEM_TIMESTAMP_PATTERN));
    }

    @Transactional
    public TaxReturn update(
            UUID taxReturnId, Map<String, FactTypeWithItem> facts, String store, Boolean surveyOptIn, UUID userId)
            throws InvalidOperationException, NoSuchMethodException, IllegalAccessException, InvocationTargetException {
        Optional<TaxReturn> existingTaxReturn = findByIdAndUserId(taxReturnId, userId);

        if (existingTaxReturn.isEmpty()) {
            log.error("Cannot update tax return {} for user: {}. Tax Return does not exist.", taxReturnId, userId);

            throw new TaxReturnNotFoundResponseStatusException(
                    String.format("Tax return %s does not exist.", taxReturnId));
        }

        TaxReturn taxReturn = existingTaxReturn.get();
        if (!factGraphService.factsParseCorrectly(facts)) {
            log.error("Cannot update tax return {} for user: {}. Facts do not parse correctly.", taxReturnId, userId);

            throw new InvalidDataException(
                    String.format("Facts do not parse correctly for tax return %s.", taxReturnId));
        }

        taxReturn.setFacts(facts);
        taxReturn.setStore(store);
        if (surveyOptIn != null) {
            taxReturn.setSurveyOptIn(surveyOptIn);
        }
        taxReturn.setDataImportBehavior(null);
        return taxReturnRepo.save(taxReturn);
    }

    private int getTimezoneOffset(Graph graph) {
        try {
            Result<Object> offset = graph.get("/offset");
            if (offset != null && offset.hasValue()) {
                return (Integer) offset.get();
            } else {
                log.warn("Unable to derive offset from fact user fact graph. Defaulting to EST (UTC -4).");
                return DEFAULT_UTC_TIMEZONE_OFFSET;
            }
        } catch (RuntimeException e) {
            log.warn("Unable to derive offset from fact user fact graph. Defaulting to EST (UTC -4).", e);
            return DEFAULT_UTC_TIMEZONE_OFFSET;
        } catch (Exception e) {
            log.warn("Unable to derive offset from fact user fact graph. Defaulting to EST (UTC -4)", e);
            return DEFAULT_UTC_TIMEZONE_OFFSET;
        }
    }

    @Transactional
    public TaxReturn submit(
            UUID taxReturnId,
            Map<String, FactTypeWithItem> facts,
            UUID userId,
            UserInfo userInfo,
            String address,
            int port,
            String userAgent)
            throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, UnknownHostException,
                    InvalidStateForTimezoneException {

        // Attempt to acquire a distributed lock for the specified tax return ID.
        // This operation is non-blocking, meaning it will return immediately
        // whether the lock is acquired or not. In a multi-threaded environment,
        // acquiring the lock for this ID does not block the execution of the method by
        // other threads to lock other IDs.

        int lockId = taxReturnId.hashCode();
        boolean lockAcquired = advisoryLockRepository.acquireLock(lockId);
        if (lockAcquired) {
            log.info("Advisory lock acquired successfully for taxReturnId={}, lockId={}", taxReturnId, lockId);
            try {
                Graph graph = factGraphService.getGraph(facts);
                return handleSelfSelectPinSignedSubmission(
                        taxReturnId, facts, graph, userInfo, address, port, userAgent);
            } catch (FactGraphParseException e) {
                log.error("Facts did not parse correctly for tax return {}", taxReturnId);

                throw new FactGraphParseResponseStatusException(e);
            } finally {
                // Regardless of the outcome, release the acquired lock
                advisoryLockRepository.releaseLock(lockId);
            }
        } else {
            // If the lock cannot be acquired, log an error and throw an exception.
            // This occurs when the same user initiates another submission action while the
            // previous one is still in progress within this method.
            log.error(
                    "Tax return {} is not editable, because an advisory lock could not be acquired, likely due to another submission from the same user currently in progress.",
                    taxReturnId);
            throw new UneditableTaxReturnResponseStatusException();
        }
    }

    protected String getPersisterJsonFromFacts(Map<String, FactTypeWithItem> facts) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(facts);
    }

    protected String getPrimaryTinFromFactEvaluationResult(FactEvaluationResult facts) {
        return facts.getOptional("/primaryFiler/tin").orElse("").toString();
    }

    private TaxReturnAndSubmission createSubmission(
            UUID taxReturnId,
            Map<String, FactTypeWithItem> facts,
            Graph graph,
            UserInfo userInfo,
            String address,
            int port,
            String userAgent)
            throws UnknownHostException, InvalidStateForTimezoneException {
        Optional<TaxReturn> optionalTaxReturn = findByIdAndUserId(taxReturnId, userInfo.id());

        if (optionalTaxReturn.isEmpty()) {
            log.error("Cannot submit. Tax return {} does not exist for user {}", taxReturnId, userInfo.id());
            throw new TaxReturnNotFoundResponseStatusException();
        }
        TaxReturn taxReturn = optionalTaxReturn.get();

        validateSubmission(graph, userInfo, taxReturn);

        TaxReturn taxReturnSaved = taxReturnRepo.save(taxReturn);
        TaxReturnSubmission trs = taxReturnSaved.addTaxReturnSubmission();
        taxReturnSubmissionRepo.save(trs);

        return new TaxReturnAndSubmission(taxReturnSaved, trs);
    }

    public void stubEnqueueDispatch() {
        // stubbed
        return;
    }

    private TaxReturn persistSubmissionAndSendToMeF(UserInfo userInfo, Graph graph, TaxReturnAndSubmission submission) {
        TaxReturn taxReturn = submission.getTaxReturn();
        String xml = "<xml>";
        String manifest = "<manifest>";
        String json = "{}";
        String mefSubmissionId = "1234562020036fk00001";

        // dispatch with the paths in the context
        DispatchContext context = new DispatchContext(xml, manifest, json, mefSubmissionId);
        try {
            dispatchService.enqueue(userInfo.id(), taxReturn, context);
            log.info("Enqueuing dispatch to submit for taxReturnId: {}", taxReturn.getId());

            var emailToSend = getFactGraphEmail(graph);
            if (emailToSend == null) {
                emailToSend = userInfo.email();
            }

            final LepLanguage lepLanguage = LepLanguage.fromFactGraph(graph);

            UUID userId = null;
            Optional<User> optUser = getUser(taxReturn);
            if (optUser.isPresent()) {
                userId = optUser.get().getId();
            }

            Map<HtmlTemplate, List<SendEmailQueueMessageBody>> emailSqsMessages = createSendEmailQueueMessageBody(
                    emailToSend,
                    LepLanguage.getDefaultIfNotEnabled(lepLanguage),
                    taxReturn.getId(),
                    mefSubmissionId,
                    userId);
            sendEmailQueueService.enqueue(emailSqsMessages);

            return taxReturn;
        } catch (Exception e) {
            log.error("Unable to generate tax return for return: {}", taxReturn.getId(), e);

            if ("XMLValidationException".equals(e.getClass().getSimpleName())) {
                persistFailedSubmissionEvent(
                        submission,
                        SubmissionEventFailureCategoryEnum.VALIDATION,
                        SubmissionEventFailureDetailEnum.XML_VALIDATION);
            } else {
                persistFailedSubmissionEvent(
                        submission,
                        SubmissionEventFailureCategoryEnum.VALIDATION,
                        SubmissionEventFailureDetailEnum.SUBMISSION_PROCESSING);
            }

            throw e;
        }
    }

    private TaxReturn handleSelfSelectPinSignedSubmission(
            UUID taxReturnId,
            Map<String, FactTypeWithItem> facts,
            Graph graph,
            UserInfo userInfo,
            String address,
            int port,
            String userAgent)
            throws UnknownHostException, InvalidStateForTimezoneException {
        TaxReturnAndSubmission submission =
                createSubmission(taxReturnId, facts, graph, userInfo, address, port, userAgent);
        return persistSubmissionAndSendToMeF(userInfo, graph, submission);
    }

    private void persistFailedSubmissionEvent(
            TaxReturnAndSubmission taxReturnAndSubmission,
            SubmissionEventFailureCategoryEnum failureCategory,
            SubmissionEventFailureDetailEnum failureDetail) {
        TaxReturnSubmission persistedTaxReturnSubmission = taxReturnAndSubmission.getTaxReturnSubmission();
        SubmissionEvent subEvent = persistedTaxReturnSubmission.addSubmissionEvent(SubmissionEventTypeEnum.FAILED);
        subEvent.setFailureCategory(failureCategory);
        subEvent.setFailureDetail(failureDetail);
        submissionEventRepository.save(subEvent);
        taxReturnSubmissionRepo.save(persistedTaxReturnSubmission);
    }

    private static Map<HtmlTemplate, List<SendEmailQueueMessageBody>> createSendEmailQueueMessageBody(
            String emailToSend, LepLanguage lepLanguage, UUID taxReturnId, String submissionId, UUID userId) {
        var emailSqsMessagesBodyList = new ArrayList<SendEmailQueueMessageBody>() {
            {
                add(new SendEmailQueueMessageBody(
                        emailToSend, lepLanguage.toCode(), taxReturnId, submissionId, userId));
            }
        };
        var emailSqsMessages = new HashMap<HtmlTemplate, List<SendEmailQueueMessageBody>>() {
            {
                put(HtmlTemplate.SUBMITTED, emailSqsMessagesBodyList);
            }
        };
        return emailSqsMessages;
    }

    private void validateSubmission(Graph graph, UserInfo userInfo, TaxReturn taxReturn) {
        log.debug("Validating submission for tax return {}", taxReturn.getId());

        if (!this.isTaxReturnEditable(taxReturn.getId())) {
            log.error("Tax return {} is not editable", taxReturn.getId());
            throw new UneditableTaxReturnResponseStatusException();
        }

        if (factGraphService.hasSubmissionBlockingFacts(graph)) {
            log.error("Submission blocking facts are true for tax return {}", taxReturn.getId());
            throw new SubmissionBlockingFactsResponseStatusException();
        }
        Boolean isResubmitting = getFactGraphIsResubmitting(graph);
        if (Boolean.TRUE.equals(isResubmitting)
                && taxReturn.getTaxReturnSubmissions().isEmpty()) {
            log.error("Cannot resubmit tax return that has never been submitted. Tax return id: {}", taxReturn.getId());
            throw new InvalidDataException(String.format(
                    "Cannot resubmit tax return that has never been submitted. Tax return id: %s", taxReturn.getId()));
        }
    }

    @Transactional
    public TaxReturnAndSubmission updateTaxReturnForSubmission(
            TaxReturn taxReturn,
            Map<String, FactTypeWithItem> facts,
            Graph graph,
            UUID userId,
            String address,
            int port,
            String userAgent)
            throws UnknownHostException, InvalidStateForTimezoneException {

        TaxReturn taxReturnSaved = taxReturnRepo.save(taxReturn);
        TaxReturnSubmission trs = taxReturnSaved.addTaxReturnSubmission();
        taxReturnSubmissionRepo.save(trs);

        return new TaxReturnAndSubmission(taxReturnSaved, trs);
    }

    @Transactional(readOnly = true)
    public StatusResponseBody getStatus(UUID taxReturnUuid, UUID userId) {
        auditService.addEventProperty(AuditLogElement.XXX_CODE, XXXCode.XXX_CODE);
        Optional<TaxReturn> optTaxReturn = findByIdAndUserId(taxReturnUuid, userId);
        if (optTaxReturn.isEmpty()) {
            // Tax Return doesn't exist OR user does not have permission to this taxreturn
            throw new TaxReturnNotFoundResponseStatusException();
        }
        TaxReturn taxReturn = optTaxReturn.get();

        Optional<TaxReturnSubmission> optTaxReturnSubmission =
                taxReturnSubmissionRepo.findLatestTaxReturnSubmissionByTaxReturnId(taxReturnUuid);
        if (optTaxReturnSubmission.isEmpty()) {
            // user has not attempted to submit this taxreturn
            throw new ResponseStatusException(
                    TaxReturnApi.GetStatusResponseBadId.code, TaxReturnApi.GetStatusResponseBadId.description);
        }
        TaxReturnSubmission taxReturnSubmission = optTaxReturnSubmission.get();

        // Check cache for submission ID (if non-null). If found, return cached StatusResponseBody.
        String submissionId = taxReturnSubmission.getSubmissionId();
        if (submissionId != null) {
            Optional<StatusResponseBody> optStatusResponseBody = statusResponseBodyCacheService.get(submissionId);
            if (optStatusResponseBody.isPresent()) {
                log.info("Cache hit getting StatusResponseBody for submission ID: {}", submissionId);
                return optStatusResponseBody.get();
            }
        }
        log.info("Cache miss getting StatusResponseBody for submission ID: {}", submissionId);

        // Cache miss: Check database for latest submission event (preferring accepted events).
        SubmissionEvent submissionEvent =
                getLatestSubmissionEventByTaxReturnIdPreferringAcceptedSubmission(taxReturnUuid);
        if (submissionEvent == null) {
            throw new ResponseStatusException(
                    TaxReturnApi.GetStatusResponseBadId.code, TaxReturnApi.GetStatusResponseBadId.description);
        }

        StatusResponseBody statusResponseBody = getStatusForSubmissionEvent(submissionEvent, submissionId, taxReturn);

        // Put the StatusResponseBody in the cache if we have a submission ID.
        if (submissionId != null) {
            log.info("Cache put of StatusResponseBody for submission ID: {}", submissionId);
            statusResponseBodyCacheService.put(submissionId, statusResponseBody);
        }

        return statusResponseBody;
    }

    protected StatusResponseBody getStatusForSubmissionEvent(
            SubmissionEvent submissionEvent, String submissionId, TaxReturn taxReturn) {
        switch (submissionEvent.getEventType()) {
            case SubmissionEventTypeEnum.ACCEPTED:
                return new StatusResponseBody(
                        Status.Accepted, "status.accepted", List.of(), submissionEvent.getCreatedAt());
            case SubmissionEventTypeEnum.REJECTED:
                // Make a REST call to the status service to get this submission's rejection codes.
                List<RejectedStatus> rejectionCodes = getRejectionCodes(submissionId);
                return new StatusResponseBody(
                        Status.Rejected, "status.rejected", rejectionCodes, submissionEvent.getCreatedAt());
            case SubmissionEventTypeEnum.FAILED:
                return new StatusResponseBody(Status.Error, "status.error", List.of(), submissionEvent.getCreatedAt());
            default:
                if (taxReturn.hasBeenSubmittedAtLeastOnce()) {
                    return new StatusResponseBody(
                            Status.Pending, "status.pending", List.of(), submissionEvent.getCreatedAt());
                } else {
                    throw new ResponseStatusException(
                            TaxReturnApi.GetStatusResponseBadId.code, TaxReturnApi.GetStatusResponseBadId.description);
                }
        }
    }

    protected List<RejectedStatus> getRejectionCodes(String submissionId) {
        // call out to the configured status application
        URI rejectionCodesUri;
        try {
            // create the URI with the query string
            rejectionCodesUri = UriComponentsBuilder.fromUri(
                            new URI(statusEndpointProperties.getRejectionCodesEndpointURI()))
                    .queryParam("submissionId", submissionId)
                    .build()
                    .toUri();
        } catch (URISyntaxException e) {
            // this could only happen if the system is wildly misconfigured
            throw new RuntimeException(e);
        }

        try {
            return restClient.get().uri(rejectionCodesUri).retrieve().body(new ParameterizedTypeReference<>() {});
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(
                    TaxReturnApi.GetStatusResponseBadId.code, TaxReturnApi.GetStatusResponseBadId.description, e);
        } catch (RestClientException e) {
            // the service is down or misconfigured!
            throw new ResponseStatusException(
                    TaxReturnApi.GetStatusBadState.code, TaxReturnApi.GetStatusBadState.description, e);
        }
    }

    @Transactional(readOnly = true)
    public Optional<StateOrProvince> getFilingStateOrProvince(TaxReturn taxReturn) {
        final var FILING_STATE_OR_PROVINCE = "/filingStateOrProvince";

        try {
            log.info("Begin determining filing state for TaxReturn {}...", taxReturn.getId());
            Graph graph = factGraphService.getGraph(taxReturn.getFacts());
            var facts = factGraphService.extractFacts(Set.of(FILING_STATE_OR_PROVINCE), graph, true);

            Optional<Object> filingStateOrProvinceFact = facts.getOptional(FILING_STATE_OR_PROVINCE);

            if (filingStateOrProvinceFact.isPresent()) {
                var filingStateOrProvinceFactValue = ((String) filingStateOrProvinceFact.get()).toUpperCase();
                try {
                    var filingStateOrProvince = StateOrProvince.valueOf(filingStateOrProvinceFactValue);
                    log.info("Successfully determined filing state for TaxReturn {}", taxReturn.getId());
                    return Optional.of(filingStateOrProvince);
                } catch (IllegalArgumentException e) {
                    log.error(
                            "Unable to determine filing state: TaxReturn value at \"{}\", \"{}\", is not one of StateOrProvince",
                            FILING_STATE_OR_PROVINCE,
                            filingStateOrProvinceFactValue);
                    return Optional.empty();
                }
            } else {
                log.info(
                        "Unable to determine filing state, TaxReturn {} does not have a derived filing state at path {}",
                        taxReturn.getId(),
                        FILING_STATE_OR_PROVINCE);
                return Optional.empty();
            }
        } catch (JsonProcessingException e) {
            log.error("Unable to extract pilot state tax facts for TaxReturn {}", taxReturn.getId(), e);
            return Optional.empty();
        } catch (ClassCastException e) {
            log.error(
                    "Encountered value of unexpected type extracting fact {} for TaxReturn {}",
                    FILING_STATE_OR_PROVINCE,
                    taxReturn.getId(),
                    e);
            return Optional.empty();
        } catch (FactGraphSaveException e) {
            log.error("Unable to save factgraph {}", taxReturn.getId(), e);
            return Optional.empty();
        }
    }

    protected void addTaxPeriodToAuditLog(int taxPeriod) {
        auditService.addEventProperty(AuditLogElement.TAX_PERIOD, Integer.toString(taxPeriod));
    }

    public String getFactGraphEmail(Graph graph) {
        final String EMAIL_PATH = "/email";

        Result<Object> email = graph.get(EMAIL_PATH);
        if (email != null && email.hasValue()) {
            return email.get().toString();
        }

        return null;
    }

    private Boolean getFactGraphIsResubmitting(Graph graph) {
        final String IS_RESUBMITTING_PATH = "/isResubmitting";

        Result<Object> isResubmitting = graph.get(IS_RESUBMITTING_PATH);
        if (isResubmitting != null && isResubmitting.hasValue()) {
            return (Boolean) isResubmitting.get();
        }

        // if we haven't set /isResubmitting, it's assumed that we're on our first submission
        return false;
    }

    /*
     * If an update request only contains email facts, we can safely assume that the update is resetting the tax return
     */
    protected boolean isResetting(Map<String, FactTypeWithItem> factsFromUpdateRequest) {
        return factsFromUpdateRequest.entrySet().size() == 1 && factsFromUpdateRequest.containsKey("/email");
    }

    private boolean factWasUpdatedWithAValue(
            String path, Map<String, FactTypeWithItem> previousFacts, Map<String, FactTypeWithItem> currentFacts) {
        // We need to use the fact graph service to get the value of the fact at the given path
        // -- especially if it's a complex type. (e.g. /bankAccount)
        GraphGetResult previousFact = factGraphService.getFact(previousFacts, path);
        GraphGetResult currentFact = factGraphService.getFact(currentFacts, path);

        // if the current fact does not have a value, return false
        if (currentFact == null || currentFact.hasError()) {
            return false;
        }

        // currentFact is known to have a value at this point, so if the previousFact does not have a value then return
        // true.
        if (previousFact == null || previousFact.hasError()) {
            return true;
        }

        Object previousFactValue = previousFact.getValue();
        Object currentFactValue = currentFact.getValue();

        // if current and previous values are different, return true
        return !currentFactValue.equals(previousFactValue);
    }

    private Optional<User> getUser(TaxReturn taxReturn) {
        return taxReturn.getOwners().stream().findFirst();
    }

    @Transactional(readOnly = true)
    public SubmissionEvent getLatestSubmissionEventByTaxReturnId(UUID taxReturnId) {
        log.info("getLatestSubmissionEventByTaxReturnId for taxReturnId {}", taxReturnId);
        Optional<SubmissionEvent> submissionEvent =
                submissionEventRepository.getLatestSubmissionEventByTaxReturnId(taxReturnId);
        return submissionEvent.orElse(null);
    }

    @Transactional(readOnly = true)
    public SubmissionEvent getLatestSubmissionEventByTaxReturnIdPreferringAcceptedSubmission(UUID taxReturnId) {
        log.info("getLatestSubmissionEventByTaxReturnIdPreferringAcceptedSubmission for taxReturnId {}", taxReturnId);
        // 1. Get the latest tax return submission for the tax return, if one exists
        Optional<TaxReturnSubmission> optionalTaxReturnSubmission =
                taxReturnSubmissionRepo.findLatestTaxReturnSubmissionByTaxReturnId(taxReturnId);

        if (optionalTaxReturnSubmission.isPresent()) {
            Set<SubmissionEvent> submissionEvents =
                    optionalTaxReturnSubmission.get().getSubmissionEvents();
            // 2. First check if the return has been accepted. If a return is accepted no reason to check for any other
            // statuses.
            Optional<SubmissionEvent> acceptedSubmissionEvent = submissionEvents.stream()
                    .filter(event -> SubmissionEventTypeEnum.ACCEPTED.equals(event.getEventType()))
                    .findAny();
            if (acceptedSubmissionEvent.isPresent()) {
                return acceptedSubmissionEvent.get();
            }

            Optional<SubmissionEvent> rejectedSubmissionEvent = submissionEvents.stream()
                    .filter(event -> SubmissionEventTypeEnum.REJECTED.equals(event.getEventType()))
                    .findAny();
            if (rejectedSubmissionEvent.isPresent()) {
                return rejectedSubmissionEvent.get();
            }
            // 3. If no status events exist for the return, return the latest event
            Optional<SubmissionEvent> mostRecentEvent =
                    submissionEvents.stream().max(Comparator.comparing(SubmissionEvent::getCreatedAt));
            return mostRecentEvent.orElse(null);
        } else {
            return null;
        }
    }
}
