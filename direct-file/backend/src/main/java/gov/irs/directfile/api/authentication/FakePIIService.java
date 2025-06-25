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
    @Override
    public Map<PIIAttribute, String> fetchAttributes(UUID userExternalId, Set<PIIAttribute> attributes) {
        Map<PIIAttribute, String> responseMap = new HashMap<>();

        for (PIIAttribute attribute : attributes) {
            String attributeValue;
            switch (attribute) {
                case PIIAttribute.EMAILADDRESS -> attributeValue = "";
                case PIIAttribute.TIN -> attributeValue = "";
                default -> attributeValue = "";
            }

            responseMap.put(attribute, attributeValue);
        }

        return responseMap;
    }
}
