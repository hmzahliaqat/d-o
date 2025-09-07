import { upsertSiteSetting } from '@documenso/lib/server-only/site-settings/upsert-site-setting';

import { adminProcedure } from '../trpc';
import {
  ZUpdateSiteSettingRequestSchema,
  ZUpdateSiteSettingResponseSchema,
} from './update-site-setting.types';

export const updateSiteSettingRoute = adminProcedure
  .input(ZUpdateSiteSettingRequestSchema)
  .output(ZUpdateSiteSettingResponseSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, enabled, data } = input;

    ctx.logger.info({
      input: {
        id,
      },
    });

    type BannerData = { content: string; textColor: string; bgColor: string };
    type PrivacyPolicyData = { content: string };

    if (id === 'site.banner') {
      await upsertSiteSetting({
        id,
        enabled,
        data: data as BannerData, // we can improve this
        userId: ctx.user.id,
      });
    } else {
      await upsertSiteSetting({
        id,
        enabled,
        data: data as PrivacyPolicyData,
        userId: ctx.user.id,
      });
    }



  });
