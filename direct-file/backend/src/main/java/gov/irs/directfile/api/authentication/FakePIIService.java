package gov.irs.directfile.api.authentication;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Slf4j
@Service
public class FakePIIService implements PIIService {
    private static final String PLACEHOLDER_ATTRIBUTE_VALUE = "FAKE_PII_PLACEHOLDER";
    public static final String TIN = "123001234";

    @Override
    public Map<PIIAttribute, String> fetchAttributes(UUID userExternalId, Set<PIIAttribute> attributes) {
        Map<PIIAttribute, String> responseMap = new HashMap<>();

        for (PIIAttribute attribute : attributes) {
            String attributeValue;
            switch (attribute) {
                case PIIAttribute.EMAILADDRESS -> attributeValue =
                        String.format("test-user+%s@directfile.test", userExternalId.toString());
                case PIIAttribute.TIN -> {
                    attributeValue = TIN;
                }
                default -> attributeValue = PLACEHOLDER_ATTRIBUTE_VALUE;
            }

            responseMap.put(attribute, attributeValue);
        }

        return responseMap;
    }
}
