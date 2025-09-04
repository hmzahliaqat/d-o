import { z } from 'zod';

import { ZSiteSettingsBaseSchema } from './_base';

export const SITE_SETTINGS_PRIVACY_POLICY_ID = 'site.privacy-policy';

export const ZSiteSettingsPrivacyPolicySchema = ZSiteSettingsBaseSchema.extend({
  id: z.literal(SITE_SETTINGS_PRIVACY_POLICY_ID),
  data: z
    .object({
      content: z.string(),
    })
    .optional()
    .default({
      content: '',
    }),
});

export type TSiteSettingsPrivacyPolicySchema = z.infer<typeof ZSiteSettingsPrivacyPolicySchema>;
