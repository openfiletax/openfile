import type { ComponentProps, HTMLInputAutoCompleteAttribute, JSXElementConstructor, ReactElement } from 'react';
import type { RawCondition } from './Condition.js';
import type { IconDisplayProps, IconName } from '../components/IconDisplay/IconDisplay.js';
import type { DFAlertProps } from '../components/Alert/DFAlert.js';
import type { ConditionalListProps } from '../components/ConditionalList/ConditionalList.js';
import type { SummaryListProps } from '../components/SummaryTable/index.js';
import type { StateInfoCardProps } from '../components/StateInfoCard/StateInfoCard.js';
import type { CommonAccordionProps } from '@irs/df-common';
import type { TaxReturnAlertProps } from '../components/Alert/TaxReturnAlert.js';
import type { ConditionalAccordionProps } from '../components/Accordion/ConditionalAccordion.js';
import type { DFModalProps } from '../components/HelperText/DFModal.js';
import type { ContentDeclarationMefAlertProps } from '../components/Alert/MefAlert.js';
import type { FlowCollectionLoop } from '../flow/flowConfig.js';
import type { AbsolutePath, Path, WritableAbsolutePath } from '../fact-dictionary/Path.js';
import type { BATCH_NAME } from './batches.js';

export interface BaseContentDeclaration {
  condition?: RawCondition;
  conditions?: RawCondition[];
  // By default, content will appear on data views and the editing experience.
  // displayOnlyOn can be passed to display the content only on a data view or an editing screen
  displayOnlyOn?: 'edit' | 'data-view';
  // The content is part of a content batch. Allows all content from the same batch to be seen from the all screens page
  batches?: BATCH_NAME[];
  hintKey?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
}
interface BaseContentDeclarationWithChildren<AllowedChildren extends FlowNode> extends BaseContentDeclaration {
  children?: AllowedChildren | AllowedChildren[];
}

interface BaseFactContentDeclaration extends BaseContentDeclaration {
  path: AbsolutePath;
}

export type ImportAgiDeclaration = BaseFactContentDeclaration;

export interface DataPreviewDeclaration extends BaseContentDeclaration {
  wasSavedFactPath: Path;
  subsubcategories: string[];
}

export interface CollectionDataPreviewDeclaration extends BaseContentDeclaration {
  subsubcategories: string[];
  nextRouteOverride: string; // the route to go if the user decides not to import the collection items
}

export interface InfoDisplayDeclaration extends BaseContentDeclaration {
  i18nKey: string;
  taxId?: string;
  inlinePDFButtonI18nKey?: string;
  borderBottom?: boolean | undefined;
  context?: object;
  className?: string;
}

export interface ScreenButtonDeclaration extends BaseContentDeclaration {
  i18nKey?: string;
  enabled?: RawCondition;
  iconName?: IconName;
  hasCertified?: boolean | undefined;
  nextRouteOverride?: string;
  isOutline?: boolean;
  collectionContext?: string;
}

export interface SaveAndOrContinueAndSetFactButtonDeclaration extends ScreenButtonDeclaration {
  i18nKey: string;
  sourcePath: Path;
  destinationPath: Path;
  shouldBlockOnErrors?: boolean;
}

export interface InternalLinkDeclaration extends BaseContentDeclaration {
  i18nKey: string;
  route: string;
  displayAsButton?: boolean;
}

export interface CollectionDataViewInternalLinkDeclaration extends BaseContentDeclaration {
  i18nKey: string;
  collectionItemPath: AbsolutePath; // should lead to a collection item
  dataViewUrl: string;
}

export interface IconDeclaration extends BaseContentDeclaration, Omit<IconDisplayProps, `children`> {}

export interface ConditionalListDeclaration
  extends BaseContentDeclaration,
    Omit<ConditionalListProps, 'collectionId' | `children`> {}

export interface DFModalDeclaration extends BaseContentDeclaration, Omit<DFModalProps, 'collectionId' | 'children'> {}

export interface StateInfoCardDeclaration
  extends BaseContentDeclaration,
    Omit<StateInfoCardProps, 'collectionId' | `children`> {}

export type StateInfoAlertDeclaration = BaseContentDeclaration & { i18nKey?: `stateInfoAlert` };

export interface SummaryTableDeclaration
  extends BaseContentDeclaration,
    Omit<ConditionalListProps, 'collectionId' | 'items' | `children`> {
  items: SummaryListProps[`items`];
}

export interface DFAlertDeclaration
  extends BaseContentDeclarationWithChildren<FlowNode<`InfoDisplay` | `DFAccordion` | `DFModal` | `ConditionalList`>>,
    Omit<DFAlertProps, 'collectionId' | `children`> {}

export interface DFAccordionDeclaration
  extends BaseContentDeclaration,
    Omit<CommonAccordionProps, 'TranslationComponent' | 'collectionId' | `children`> {
  internalLink?: string;
}

export interface TaxReturnAlertDeclaration extends BaseContentDeclaration, Omit<TaxReturnAlertProps, 'collectionId'> {
  children?: DFAlertDeclaration[`children`];
}

export interface MefAlertDeclaration
  extends BaseContentDeclaration,
    Omit<ContentDeclarationMefAlertProps, `children`> {}

export interface InfoDisplayCollectionDeclaration extends BaseFactContentDeclaration {
  i18nKey: string;
}

export interface AssertionDeclaration extends BaseContentDeclaration {
  i18nKey: string;
  type: `success` | `warning` | `inactive` | `info`;
  editRoute?: string;
}

export interface ResultAssertionDeclaration extends BaseContentDeclaration {
  i18nKey: string;
}

export interface ConditionalAccordionDeclaration
  extends BaseContentDeclaration,
    Omit<ConditionalAccordionProps, 'collectionId' | 'children'> {}

export interface FactDeclaration extends BaseFactContentDeclaration {
  // All declaration props are strings so that we can eventually
  // turn `flow.tsx` into more serializable configuration
  readOnly?: boolean;
  required?: false;
  labelledBy?: 'heading' | 'legend';
  isSensitive?: boolean;
  editRoute?: string;
  renderAs?: 'radio' | 'select';
  dataViewAnchorLink?: string;
  importedPath?: AbsolutePath;
  inputSuffix?: string;
  defaultValue?: string;
}

export interface DollarFactDeclaration extends FactDeclaration {
  hasZeroOverride?: true;
}

export interface BooleanFactDeclaration extends FactDeclaration {
  inputType?: 'radio' | 'checkbox';
  i18nKeySuffixContext?: string;
}

export interface EnumFactDeclaration extends FactDeclaration {
  i18nKeySuffixContext?: string;
  skipBlank?: true;
}

export interface MultiEnumFactDeclaration extends FactDeclaration {
  labelledBy?: 'heading' | 'legend';
  i18nKeySuffixContext?: string;
}

export interface DatePickerFactDeclaration extends FactDeclaration {
  lockYearTo?: Path; // lockYearTo lets you provide a fact to lock the year to
  lastAllowableDatePath?: Path;
  disallowPastDates?: boolean;
}

export interface AddressFactDeclaration extends FactDeclaration {
  useCombinedStreetLengthForValidation?: true;
}

interface FactSelectDeclaration extends FactDeclaration {
  label?: string;
}

export type FactActionExternalSource = `df.language` | `emptyCollection`;
export type FactActionSource = Path | FactActionExternalSource;
export interface FactActionDeclaration extends BaseFactContentDeclaration {
  source: FactActionSource;
}

// If you include a loopName, this will give you a button to exit the loop
// Without a loopName, you'll just have a button to create an item.
export interface CollectionItemManagerDeclaration extends BaseFactContentDeclaration {
  loopName: string;
  donePath: WritableAbsolutePath;
  shouldSeeHubCompletionBtnsPath?: AbsolutePath;
  loop?: FlowCollectionLoop;
}

export interface CollectionControlDeclaration extends BaseFactContentDeclaration {
  loopName: string;
  iconName?: IconName;
}

type FlowNodeConstructor<C extends string, P extends object> = JSXElementConstructor<P> & { name: C };

// TODO: Eliminate the need for double-writing the component name
export const InfoDisplay = (() => <></>) as FlowNodeConstructor<`InfoDisplay`, InfoDisplayDeclaration>;
export const ContextHeading = (() => <></>) as FlowNodeConstructor<`ContextHeading`, InfoDisplayDeclaration>;
export const Heading = (() => <></>) as FlowNodeConstructor<`Heading`, InfoDisplayDeclaration>;
export const Subheading = (() => <></>) as FlowNodeConstructor<`Subheading`, InfoDisplayDeclaration>;
export const HelpLink = (() => <></>) as FlowNodeConstructor<`HelpLink`, InfoDisplayDeclaration>;
export const CertifyCheckbox = (() => <></>) as FlowNodeConstructor<`CertifyCheckbox`, InfoDisplayDeclaration>;
export const FileYourStateTaxesDetails = (() => <></>) as FlowNodeConstructor<
  `FileYourStateTaxesDetails`,
  InfoDisplayDeclaration
>;
export const Hint = (() => <></>) as FlowNodeConstructor<`Hint`, InfoDisplayDeclaration>;
export const DFModal = (() => <></>) as FlowNodeConstructor<`DFModal`, DFModalDeclaration>;
export const DFAccordion = (() => <></>) as FlowNodeConstructor<`DFAccordion`, DFAccordionDeclaration>;
// For displaying informational content styled as alerts within page body
export const DFAlert = (() => <></>) as FlowNodeConstructor<`DFAlert`, DFAlertDeclaration>;
// For displaying alerts within the Tax Return alert aggregation system
export const TaxReturnAlert = (() => <></>) as FlowNodeConstructor<`TaxReturnAlert`, TaxReturnAlertDeclaration>;
// For displaying alerts related to MeF rejections within the Tax Return alert aggregation system
export const MefAlert = (() => <></>) as FlowNodeConstructor<`MefAlert`, MefAlertDeclaration>;
export const IconDisplay = (() => <></>) as FlowNodeConstructor<`IconDisplay`, IconDeclaration>;
export const InternalLink = (() => <></>) as FlowNodeConstructor<`InternalLink`, InternalLinkDeclaration>;
export const CollectionDataViewInternalLink = (() => <></>) as FlowNodeConstructor<
  `CollectionDataViewInternalLink`,
  CollectionDataViewInternalLinkDeclaration
>;
export const GenericString = (() => <></>) as FlowNodeConstructor<`GenericString`, FactDeclaration>;
export const DatePicker = (() => <></>) as FlowNodeConstructor<`DatePicker`, DatePickerFactDeclaration>;
export const Address = (() => <></>) as FlowNodeConstructor<`Address`, AddressFactDeclaration>;
export const BankAccount = (() => <></>) as FlowNodeConstructor<`BankAccount`, FactDeclaration>;
export const PhoneNumber = (() => <></>) as FlowNodeConstructor<`PhoneNumber`, FactDeclaration>;
export const Boolean = (() => <></>) as FlowNodeConstructor<`Boolean`, BooleanFactDeclaration>;
export const MultiEnum = (() => <></>) as FlowNodeConstructor<`MultiEnum`, MultiEnumFactDeclaration>;
export const Tin = (() => <></>) as FlowNodeConstructor<`Tin`, FactDeclaration>;
export const Enum = (() => <></>) as FlowNodeConstructor<`Enum`, EnumFactDeclaration>;
export const Ein = (() => <></>) as FlowNodeConstructor<`Ein`, FactDeclaration>;
export const Dollar = (() => <></>) as FlowNodeConstructor<`Dollar`, DollarFactDeclaration>;
export const Pin = (() => <></>) as FlowNodeConstructor<`Pin`, FactDeclaration>;
export const CollectionItemReference = (() => <></>) as FlowNodeConstructor<`CollectionItemReference`, FactDeclaration>;
export const SubmitButton = (() => <></>) as FlowNodeConstructor<`SubmitButton`, ScreenButtonDeclaration>;
export const ExitButton = (() => <></>) as FlowNodeConstructor<`ExitButton`, ScreenButtonDeclaration>;
export const SaveAndOrContinueButton = (() => <></>) as FlowNodeConstructor<
  `SaveAndOrContinueButton`,
  ScreenButtonDeclaration
>;
export const SaveAndOrContinueAndSetFactButton = (() => <></>) as FlowNodeConstructor<
  `SaveAndOrContinueAndSetFactButton`,
  SaveAndOrContinueAndSetFactButtonDeclaration
>;
// TODO: Remove `SectionReview` from `InfoDisplayTypes`
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SectionReview = (({ i18nKey = `SectionReview` }) => <></>) as FlowNodeConstructor<
  `SectionReview`,
  BaseContentDeclaration & { i18nKey?: `SectionReview` }
>;
export const KnockoutButton = (() => <></>) as FlowNodeConstructor<`KnockoutButton`, ScreenButtonDeclaration>;
export const DownloadPDFButton = (() => <></>) as FlowNodeConstructor<`DownloadPDFButton`, ScreenButtonDeclaration>;
export const CollectionItemManager = (() => <></>) as FlowNodeConstructor<
  `CollectionItemManager`,
  CollectionItemManagerDeclaration
>;
export const SetFactAction = (() => <></>) as FlowNodeConstructor<`SetFactAction`, FactActionDeclaration>;
export const IconList = (() => <></>) as FlowNodeConstructor<`IconList`, InfoDisplayDeclaration>;
export const FactSelect = (() => <></>) as FlowNodeConstructor<`FactSelect`, FactSelectDeclaration>;
export const IntroContent = (() => <></>) as FlowNodeConstructor<`IntroContent`, InfoDisplayDeclaration>;
export const BigContent = (() => <></>) as FlowNodeConstructor<`BigContent`, InfoDisplayDeclaration>;
export const SummaryTable = (() => <></>) as FlowNodeConstructor<`SummaryTable`, SummaryTableDeclaration>;
export const ConditionalList = (() => <></>) as FlowNodeConstructor<`ConditionalList`, ConditionalListDeclaration>;
export const StateInfoCard = (() => <></>) as FlowNodeConstructor<`StateInfoCard`, StateInfoCardDeclaration>;
export const StateTaxReminderAlertWrapper = (() => <></>) as FlowNodeConstructor<
  `StateTaxReminderAlertWrapper`,
  StateInfoAlertDeclaration
>;
export const IpPin = (() => <></>) as FlowNodeConstructor<`IpPin`, FactDeclaration>;
export const SpouseCreator = (() => <></>) as FlowNodeConstructor<`SpouseCreator`, FactDeclaration>;
export const FactAssertion = (() => <></>) as FlowNodeConstructor<`FactAssertion`, AssertionDeclaration>;
export const FactResultAssertion = (() => <></>) as FlowNodeConstructor<
  `FactResultAssertion`,
  ResultAssertionDeclaration
>;
export const ConditionalAccordion = (() => <></>) as FlowNodeConstructor<
  `ConditionalAccordion`,
  ConditionalAccordionDeclaration
>;
export const LimitingString = (() => <></>) as FlowNodeConstructor<`LimitingString`, FactDeclaration>;
export const StateTaxesButton = (() => <></>) as FlowNodeConstructor<`StateTaxesButton`, ScreenButtonDeclaration>;
export const DataPreview = (() => <></>) as FlowNodeConstructor<`DataPreview`, DataPreviewDeclaration>;
export const CollectionDataPreview = (() => <></>) as FlowNodeConstructor<
  `CollectionDataPreview`,
  CollectionDataPreviewDeclaration
>;

export const FactTypes = {
  Address,
  BankAccount,
  Boolean,
  CollectionItemReference,
  DatePicker,
  Dollar,
  Ein,
  Enum,
  MultiEnum,
  FactSelect,
  GenericString,
  IpPin,
  LimitingString,
  PhoneNumber,
  Pin,
  Tin,
};

export const InfoDisplayTypes = {
  BigContent,
  CertifyCheckbox,
  ConditionalAccordion,
  ContextHeading,
  DFModal,
  DFAccordion,
  FactAssertion,
  FactResultAssertion,
  FileYourStateTaxesDetails,
  Heading,
  HelpLink,
  Hint,
  IconList,
  InfoDisplay,
  IntroContent,
  SectionReview,
  StateInfoCard,
  StateTaxReminderAlertWrapper,
  Subheading,
};

export const IconDisplayTypes = {
  IconDisplay,
};

export const ConditionalListTypes = {
  ConditionalList,
  SummaryTable,
};

export const InternalLinkTypes = {
  InternalLink,
};

export const CollectionDataViewInternalLinkTypes = {
  CollectionDataViewInternalLink,
};

export const DFAlertTypes = {
  DFAlert,
};

export const AggregatedAlertTypes = {
  TaxReturnAlert,
  MefAlert,
};

export const AlertTypes = {
  TaxReturnAlert,
  MefAlert,
};

export const CollectionItemManagerTypes = {
  CollectionItemManager,
};

export const FactActionTypes = {
  SetFactAction,
};

export const ScreenButtonTypes = {
  DownloadPDFButton,
  ExitButton,
  KnockoutButton,
  SaveAndOrContinueButton,
  SaveAndOrContinueAndSetFactButton,
  SubmitButton,
  StateTaxesButton,
};

export const DataPreviewTypes = {
  DataPreview,
};
export const CollectionDataPreviewTypes = {
  CollectionDataPreview,
};

export const AllComponentTypes = {
  ...FactTypes,
  ...InfoDisplayTypes,
  ...IconDisplayTypes,
  ...DFAlertTypes,
  ...AggregatedAlertTypes,
  ...CollectionItemManagerTypes,
  ...InternalLinkTypes,
  ...ConditionalListTypes,
  ...ScreenButtonTypes,
  ...CollectionDataViewInternalLinkTypes,
  ...DataPreviewTypes,
  ...CollectionDataPreviewTypes,
};

export const AllNodeTypes = {
  ...AllComponentTypes,
  ...FactActionTypes,
} satisfies {
  // Ensure that all component type data matches their key
  [ComponentName in keyof typeof AllComponentTypes | keyof typeof FactActionTypes]: FlowNodeConstructor<
    ComponentName,
    // We use `any` here because `object` and `unknown` both result in type errors with valid content and this satisfies
    // check is just to ensure that we have a valid JSX constructor with the name set correctly
    // The typing of AllNodTypes will not include this `any`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >;
};

Object.entries(AllNodeTypes).forEach(([componentName, constructor]) => {
  // Ensure that constructor names are preserved at runtime
  Object.defineProperty(constructor, `name`, { value: componentName, writable: false });
});

// All utility types with the C parameter will default to representing a type related to any valid flow component
// Providing C results in a narrower type representing only the types related to the components represented by C
export type FlowComponentName = keyof typeof AllNodeTypes;
export type FlowNodeType<C extends FlowComponentName = FlowComponentName> = (typeof AllNodeTypes)[C];
// The conditional type definitions flatten the resulting type to enable intuitive type narrowing
// It also prevents BaseDeclaration from being a union (probably?)
// See: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
export type FlowNode<C extends FlowComponentName = FlowComponentName> = C extends string
  ? ReactElement<ComponentProps<FlowNodeType<C>>, FlowNodeType<C>>
  : never;

// TODO: Find out why the type of AllowedChildren is broader than it should be
export type ConfigProps<P extends ComponentProps<FlowNodeType>> = P extends {
  children?: infer AllowedChildren;
}
  ? Extract<AllowedChildren, FlowNode> extends FlowNode
    ? Omit<P, `children`> & { childConfigs: FlowComponentConfig<Extract<AllowedChildren, FlowNode>[`type`][`name`]>[] }
    : never
  : P;
export type FlowComponentConfig<C extends FlowComponentName = FlowComponentName> = C extends string
  ? {
      componentName: C;
      props: ConfigProps<ComponentProps<FlowNodeType<C>>>;
    }
  : never;

export function isFactAction(contentNode: ScreenContentNode): contentNode is FlowNode<`SetFactAction`> {
  return !Array.isArray(contentNode) && contentNode.type === SetFactAction;
}

export type ScreenContentConfig = FlowComponentConfig<keyof typeof AllComponentTypes>;

// TODO: I suspect the below can all be replaced with a mapped type if I can figure it out
// but we should be able to associate the keys with the declaration type more easily.
export type FactConfig = FlowComponentConfig<keyof typeof FactTypes>;
export type InfoDisplayConfig = FlowComponentConfig<keyof typeof InfoDisplayTypes>;
export type IconDisplayConfig = FlowComponentConfig<keyof typeof IconDisplayTypes>;
export type ConditionalListConfig = FlowComponentConfig<keyof typeof ConditionalListTypes>;
export type DFAlertConfig = FlowComponentConfig<keyof typeof DFAlertTypes>;
export type AggregatedAlertConfig = FlowComponentConfig<keyof typeof AggregatedAlertTypes>;

export type InternalLinkConfig = FlowComponentConfig<keyof typeof InternalLinkTypes>;
export type DataPreviewConfig = FlowComponentConfig<keyof typeof DataPreviewTypes>;
export type CollectionDataPreviewConfig = FlowComponentConfig<keyof typeof CollectionDataPreviewTypes>;

export type CollectionDataViewInternalLinkConfig = FlowComponentConfig<
  keyof typeof CollectionDataViewInternalLinkTypes
>;

export type CollectionItemManagerConfig = FlowComponentConfig<keyof typeof CollectionItemManagerTypes>;

export type ScreenButtonConfig = FlowComponentConfig<keyof typeof ScreenButtonTypes>;

export type ConditionalAccordionConfig = FlowComponentConfig<`ConditionalAccordion`>;

export function contentConfigIsFactConfig(config: ScreenContentConfig): config is FactConfig {
  return Object.keys(FactTypes).includes(config.componentName);
}
export function contentConfigIsInternalLinkConfig(config: ScreenContentConfig): config is InternalLinkConfig {
  return Object.keys(InternalLinkTypes).includes(config.componentName);
}
export function contentConfigIsDataPreviewConfig(config: ScreenContentConfig): config is DataPreviewConfig {
  return Object.keys(DataPreviewTypes).includes(config.componentName);
}
export function contentConfigIsCollectionDataPreviewConfig(
  config: ScreenContentConfig
): config is CollectionDataPreviewConfig {
  return Object.keys(CollectionDataPreviewTypes).includes(config.componentName);
}
export function contentConfigIsCollectionDataViewInternalLinkConfig(
  config: ScreenContentConfig
): config is CollectionDataViewInternalLinkConfig {
  return Object.keys(CollectionDataViewInternalLinkTypes).includes(config.componentName);
}
export function contentConfigIsInfoDisplayConfig(config: ScreenContentConfig): config is InfoDisplayConfig {
  return Object.keys(InfoDisplayTypes).includes(config.componentName);
}
export function contentConfigIsIconDisplayConfig(config: ScreenContentConfig): config is IconDisplayConfig {
  return Object.keys(IconDisplayTypes).includes(config.componentName);
}
export function contentConfigIsDFAlertConfig(config: ScreenContentConfig): config is DFAlertConfig {
  return Object.keys(DFAlertTypes).includes(config.componentName);
}
export function contentConfigIsAggregatedAlertConfig(config: ScreenContentConfig): config is AggregatedAlertConfig {
  return Object.keys(AggregatedAlertTypes).includes(config.componentName);
}
export function contentConfigIsConditionalListConfig(config: ScreenContentConfig): config is ConditionalListConfig {
  return Object.keys(ConditionalListTypes).includes(config.componentName);
}
export function contentConfigIsCollectionItemManagerConfig(
  config: ScreenContentConfig
): config is CollectionItemManagerConfig {
  return Object.keys(CollectionItemManagerTypes).includes(config.componentName);
}
export function contentConfigIsFactAction(
  config: FlowComponentConfig
): config is FlowComponentConfig<keyof typeof FactActionTypes> {
  return config.componentName in FactActionTypes;
}

export function contentConfigIsScreenButtonConfig(config: ScreenContentConfig): config is ScreenButtonConfig {
  return Object.keys(ScreenButtonTypes).includes(config.componentName);
}

export function contentConfigIsConditionalAccordionConfig(
  config: ScreenContentConfig
): config is ConditionalAccordionConfig {
  return config.componentName === `ConditionalAccordion`;
}

export type ScreenContentNode = FlowNode<ScreenContentConfig[`componentName`] | keyof typeof FactActionTypes>;
