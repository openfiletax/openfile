import { useState } from 'react';
import * as sfg from '@irs/js-factgraph-scala';
import { FactProps } from '../../../types/core.js';
import { useTranslation } from 'react-i18next';
import { stripNonNumeric } from '../../../misc/misc.js';
import useFact from '../../../hooks/useFact.js';
import { LabelConfig, TextFormControl } from '../../FormControl/index.js';
import { useFactGraph } from '../../../factgraph/FactGraphContext.js';

const Tin = ({
  path,
  onValidData,
  showFeedback = false,
  isValid,
  required,
  concretePath,
  defaultValue,
  readOnly,
  collectionId,
  hintKey,
}: FactProps) => {
  const [fact, setFact, clearFact] = useFact<sfg.Tin>(concretePath);
  const { factGraph } = useFactGraph();

  const allowAllZeros = factGraph.getFact(concretePath).value.allowAllZeros;

  const { t } = useTranslation(`translation`);
  const [validationErrorCode, setValidationErrorCode] = useState<string>();

  const setValidity = (isValid: boolean) => {
    onValidData(concretePath, isValid);
  };

  let labelConfig: LabelConfig;
  const isTinReadOnly = readOnly === true; // readOnly is a string, from XML

  const showError = showFeedback && !isValid;
  return (
    <>
      <TextFormControl
        path={path}
        collectionId={collectionId}
        concretePath={concretePath}
        labelConfig={labelConfig}
        hintKey={hintKey}
        setValidity={setValidity}
        onError={(err: sfg.TinValidationFailure) => {
          setValidationErrorCode(err.validationMessage.toUserFriendlyReason().toString());
        }}
        setFact={setFact}
        clearFact={clearFact}
        required={required}
        factParser={(rawValue: string) => sfg.TinFactory(stripNonNumeric(rawValue), allowAllZeros)}
        errorMessage={showError ? (t(`fields.${path}.errorMessages.${validationErrorCode}`) as string) : undefined}
        inputMode='numeric'
        type='text'
        mask={`___-__-____`}
        readOnly={isTinReadOnly}
        defaultValue={defaultValue ?? `${fact ?? ``}`}
      />
    </>
  );
};

export default Tin;
