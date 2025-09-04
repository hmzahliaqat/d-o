import { zodResolver } from '@hookform/resolvers/zod';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useForm } from 'react-hook-form';
import { useRevalidator } from 'react-router';
import type { z } from 'zod';

import { getSiteSettings } from '@documenso/lib/server-only/site-settings/get-site-settings';
import {
  SITE_SETTINGS_PRIVACY_POLICY_ID,
  ZSiteSettingsPrivacyPolicySchema,
} from '@documenso/lib/server-only/site-settings/schemas/privacy-policy';
import { trpc as trpcReact } from '@documenso/trpc/react';
import { Button } from '@documenso/ui/primitives/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Switch } from '@documenso/ui/primitives/switch';
import { Textarea } from '@documenso/ui/primitives/textarea';
import { useToast } from '@documenso/ui/primitives/use-toast';

import { SettingsHeader } from '~/components/general/settings-header';

// Types will be generated during build
// import type { Route } from './+types/privacy-policy';
type ComponentProps = {
  loaderData: {
    privacyPolicy?: {
      id: string;
      enabled: boolean;
      data?: {
        content: string;
      };
    };
  };
};

const ZPrivacyPolicyFormSchema = ZSiteSettingsPrivacyPolicySchema;

type TPrivacyPolicyFormSchema = z.infer<typeof ZPrivacyPolicyFormSchema>;

export async function loader() {
  const privacyPolicy = await getSiteSettings().then((settings) =>
    settings.find((setting) => setting.id === SITE_SETTINGS_PRIVACY_POLICY_ID),
  );

  return { privacyPolicy };
}

export default function AdminPrivacyPolicyPage({ loaderData }: ComponentProps) {
  const { privacyPolicy } = loaderData;

  const { toast } = useToast();
  const { _ } = useLingui();
  const { revalidate } = useRevalidator();

  const form = useForm<TPrivacyPolicyFormSchema>({
    resolver: zodResolver(ZPrivacyPolicyFormSchema),
    defaultValues: {
      id: SITE_SETTINGS_PRIVACY_POLICY_ID,
      enabled: privacyPolicy?.enabled ?? false,
      data: {
        content: privacyPolicy?.data?.content ?? '',
      },
    },
  });

  const enabled = form.watch('enabled');

  const { mutateAsync: updateSiteSetting, isPending: isUpdateSiteSettingLoading } =
    trpcReact.admin.updateSiteSetting.useMutation();

  const onPrivacyPolicyUpdate = async ({ id, enabled, data }: TPrivacyPolicyFormSchema) => {
    try {
      await updateSiteSetting({
        id,
        enabled,
        data,
      });

      toast({
        title: _(msg`Privacy Policy Updated`),
        description: _(msg`Your privacy policy has been updated successfully.`),
        duration: 5000,
      });

      await revalidate();
    } catch (err) {
      toast({
        title: _(msg`An unknown error occurred`),
        variant: 'destructive',
        description: _(
          msg`We encountered an unknown error while attempting to update the privacy policy. Please try again later.`,
        ),
      });
    }
  };

  return (
    <div>
      <SettingsHeader
        title={_(msg`Privacy Policy`)}
        subtitle={_(msg`Manage your privacy policy content here`)}
      />

      <div className="mt-8">
        <div>
          <h2 className="font-semibold">
            <Trans>Privacy Policy Content</Trans>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            <Trans>
              The privacy policy is displayed to users on the privacy policy page. Enable or disable
              it and customize the content below.
            </Trans>
          </p>

          <Form {...form}>
            <form
              className="mt-4 flex flex-col rounded-md"
              onSubmit={form.handleSubmit(onPrivacyPolicyUpdate)}
            >
              <div className="mt-4 flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        <Trans>Enabled</Trans>
                      </FormLabel>

                      <FormControl>
                        <div>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <fieldset disabled={!enabled} aria-disabled={!enabled}>
                  <FormField
                    control={form.control}
                    name="data.content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans>Content</Trans>
                        </FormLabel>

                        <FormControl>
                          <Textarea className="h-96 resize-none font-mono" {...field} />
                        </FormControl>

                        <FormDescription>
                          <Trans>The content of your privacy policy, HTML is allowed</Trans>
                        </FormDescription>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              </div>

              <Button
                type="submit"
                loading={isUpdateSiteSettingLoading}
                className="mt-4 justify-end self-end"
              >
                <Trans>Update Privacy Policy</Trans>
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
