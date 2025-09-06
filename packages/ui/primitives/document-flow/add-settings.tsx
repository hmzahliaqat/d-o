import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  DocumentStatus,
  DocumentVisibility,
  type Field,
  type Recipient,
  SendStatus,
  TeamMemberRole,
} from '@prisma/client';
import { InfoIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { match } from 'ts-pattern';

import { useCurrentOrganisation } from '@documenso/lib/client-only/providers/organisation';
import { DATE_FORMATS, DEFAULT_DOCUMENT_DATE_FORMAT } from '@documenso/lib/constants/date-formats';
import { DOCUMENT_SIGNATURE_TYPES } from '@documenso/lib/constants/document';
import { SUPPORTED_LANGUAGES } from '@documenso/lib/constants/i18n';
import { DEFAULT_DOCUMENT_TIME_ZONE, TIME_ZONES } from '@documenso/lib/constants/time-zones';
import type { TDocument } from '@documenso/lib/types/document';
import { extractDocumentAuthMethods } from '@documenso/lib/utils/document-auth';
import { extractTeamSignatureSettings } from '@documenso/lib/utils/teams';
import {
  DocumentGlobalAuthAccessSelect,
  DocumentGlobalAuthAccessTooltip,
} from '@documenso/ui/components/document/document-global-auth-access-select';
import {
  DocumentGlobalAuthActionSelect,
  DocumentGlobalAuthActionTooltip,
} from '@documenso/ui/components/document/document-global-auth-action-select';
import {
  DocumentReadOnlyFields,
  mapFieldsWithRecipients,
} from '@documenso/ui/components/document/document-read-only-fields';
import {
  DocumentVisibilitySelect,
  DocumentVisibilityTooltip,
} from '@documenso/ui/components/document/document-visibility-select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@documenso/ui/primitives/accordion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { MultiSelectCombobox } from '@documenso/ui/primitives/multi-select-combobox';

import { DocumentSignatureSettingsTooltip } from '../../components/document/document-signature-settings-tooltip';
import { Combobox } from '../combobox';
import { Input } from '../input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { useStep } from '../stepper';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip';
import type { TAddSettingsFormSchema } from './add-settings.types';
import { ZAddSettingsFormSchema } from './add-settings.types';
import {
  DocumentFlowFormContainerActions,
  DocumentFlowFormContainerContent,
  DocumentFlowFormContainerFooter,
  DocumentFlowFormContainerHeader,
  DocumentFlowFormContainerStep,
} from './document-flow-root';
import type { DocumentFlowStep } from './types';

export type AddSettingsFormProps = {
  documentFlow: DocumentFlowStep;
  recipients: Recipient[];
  fields: Field[];
  isDocumentPdfLoaded: boolean;
  document: TDocument;
  currentTeamMemberRole?: TeamMemberRole;
  onSubmit: (_data: TAddSettingsFormSchema) => void;
};

export const AddSettingsFormPartial = ({
  documentFlow,
  recipients,
  fields,
  isDocumentPdfLoaded,
  document,
  currentTeamMemberRole,
  onSubmit,
}: AddSettingsFormProps) => {
  const { t } = useLingui();

  const organisation = useCurrentOrganisation();

  const { documentAuthOption } = extractDocumentAuthMethods({
    documentAuth: document.authOptions,
  });

  const form = useForm<TAddSettingsFormSchema>({
    resolver: zodResolver(ZAddSettingsFormSchema),
    defaultValues: {
      title: document.title,
      externalId: document.externalId || '',
      visibility: document.visibility || '',
      globalAccessAuth: documentAuthOption?.globalAccessAuth || [],
      globalActionAuth: documentAuthOption?.globalActionAuth || [],

      meta: {
        timezone:
          TIME_ZONES.find((timezone) => timezone === document.documentMeta?.timezone) ??
          DEFAULT_DOCUMENT_TIME_ZONE,
        dateFormat:
          DATE_FORMATS.find((format) => format.value === document.documentMeta?.dateFormat)
            ?.value ?? DEFAULT_DOCUMENT_DATE_FORMAT,
        redirectUrl: document.documentMeta?.redirectUrl ?? '',
        language: document.documentMeta?.language ?? 'en',
        signatureTypes: extractTeamSignatureSettings(document.documentMeta),
      },
    },
  });

  const { stepIndex, currentStep, totalSteps, previousStep } = useStep();

  const documentHasBeenSent = recipients.some(
    (recipient) => recipient.sendStatus === SendStatus.SENT,
  );

  const canUpdateVisibility = match(currentTeamMemberRole)
    .with(TeamMemberRole.ADMIN, () => true)
    .with(
      TeamMemberRole.MANAGER,
      () =>
        document.visibility === DocumentVisibility.EVERYONE ||
        document.visibility === DocumentVisibility.MANAGER_AND_ABOVE,
    )
    .otherwise(() => false);

  const onFormSubmit = form.handleSubmit(onSubmit);

  const onGoNextClick = () => {
    void onFormSubmit().catch(console.error);
  };

  // We almost always want to set the timezone to the user's local timezone to avoid confusion
  // when the document is signed.
  useEffect(() => {
    if (
      !form.formState.touchedFields.meta?.timezone &&
      !documentHasBeenSent &&
      !document.documentMeta?.timezone
    ) {
      form.setValue('meta.timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, [
    documentHasBeenSent,
    form,
    form.setValue,
    form.formState.touchedFields.meta?.timezone,
    document.documentMeta?.timezone,
  ]);

  return (
    <>
      <DocumentFlowFormContainerHeader
        title={documentFlow.title}
        description={documentFlow.description}
      />

      <DocumentFlowFormContainerContent>
        {isDocumentPdfLoaded && (
          <DocumentReadOnlyFields
            showRecipientColors={true}
            recipientIds={recipients.map((recipient) => recipient.id)}
            fields={mapFieldsWithRecipients(fields, recipients)}
          />
        )}

        <Form {...form}>
          <fieldset
            className="flex h-full flex-col space-y-6"
            disabled={form.formState.isSubmitting}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    <Trans>Title</Trans>
                  </FormLabel>

                  <FormControl>
                    <Input
                      className="bg-background"
                      {...field}
                      disabled={document.status !== DocumentStatus.DRAFT || field.disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {organisation.organisationClaim.flags.cfr21 && (
              <FormField
                control={form.control}
                name="globalActionAuth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-row items-center">
                      <Trans>Recipient action authentication</Trans>
                      <DocumentGlobalAuthActionTooltip />
                    </FormLabel>

                    <FormControl>
                      <DocumentGlobalAuthActionSelect
                        value={field.value}
                        disabled={field.disabled}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

          </fieldset>
        </Form>
      </DocumentFlowFormContainerContent>

      <DocumentFlowFormContainerFooter>
        <DocumentFlowFormContainerStep step={currentStep} maxStep={totalSteps} />

        <DocumentFlowFormContainerActions
          loading={form.formState.isSubmitting}
          disabled={form.formState.isSubmitting}
          canGoBack={stepIndex !== 0}
          onGoBackClick={previousStep}
          onGoNextClick={onGoNextClick}
        />
      </DocumentFlowFormContainerFooter>
    </>
  );
};
