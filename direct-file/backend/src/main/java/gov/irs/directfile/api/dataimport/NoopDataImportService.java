package gov.irs.directfile.api.dataimport;

import java.util.Collections;
import java.util.Date;
import java.util.UUID;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import gov.irs.directfile.api.dataimport.model.WrappedPopulatedData;

@Service
@Primary
public class NoopDataImportService implements DataImportService {

    @Override
    public void sendPreFetchRequest(UUID taxReturnId, UUID userId, UUID externalId, String tin, int taxYear) {}

    @Override
    public WrappedPopulatedData getPopulatedData(UUID taxReturnId, UUID userId, Date taxReturnCreatedAt) {
        return WrappedPopulatedData.from(Collections.emptyList(), taxReturnCreatedAt);
    }
}
