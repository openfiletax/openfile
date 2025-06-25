import * as sfg from '@irs/js-factgraph-scala';
import { forwardRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FactProps } from '../../../types/core.js';
import useFact from '../../../hooks/useFact.js';
import { TextFormControl } from '../../FormControl/index.js';
import { getFactIntLimit, getFactStringLimit } from '../../../factgraph/factLimitHelpers.js';

const LimitingString = forwardRef<HTMLInputElement, FactProps>(
  (
    {
      path,
      onValidData,
      showFeedback = false,
      isValid,
      concretePath,
      collectionId,
      required = true,
      hintKey,
      defaultValue,
      readOnly,
      inputSuffix,
      autoComplete,
    },
    ref
  ) => {
    const [fact, setFact, clearFact] = useFact<sfg.LimitingString>(concretePath);

    const { t } = useTranslation(`translation`);
    const [validationErrorCode, setValidationErrorCode] = useState<string>();

    const setValidity = (isValid: boolean) => {
      onValidData(concretePath, isValid);
    };

    const factParser = useCallback(
      (rawValue: string) => {
        const regexMatchPattern = getFactStringLimit(path, `Match`);
        return sfg.StringFactory(rawValue, regexMatchPattern);
      },
      [path]
    );
    const showError = showFeedback && !isValid;

    return (
      <TextFormControl
        key={`text-form-${fact}`}
        path={path}
        concretePath={concretePath}
        collectionId={collectionId}
        hintKey={hintKey}
        setValidity={setValidity}
        onError={(err: sfg.StringValidationFailure) => {
          setValidationErrorCode(err.validationMessage.toString());
        }}
        setFact={setFact}
        clearFact={clearFact}
        required={required}
        factParser={factParser}
        errorMessage={
          showError ? (t(`fields.generics.limitingString.errorMessages.${validationErrorCode}`) as string) : undefined
        }
        inputRef={ref}
        inputMode='text'
        type='text'
        defaultValue={defaultValue ?? fact as string}
        maxLength={getFactIntLimit(path, `MaxLength`)}
        readOnly={readOnly}
        inputSuffix={inputSuffix}
        autoComplete={autoComplete}
      />
    );
  }
);
LimitingString.displayName = `LimitingString`;

export default LimitingString;
