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

    await upsertSiteSetting(
      id === 'site.banner'
        ? {
          id,
          enabled,
          data: data as { content: string; textColor: string; bgColor: string },
          userId: ctx.user.id,
        }
        : {
          id,
          enabled,
          data: data as { content: string },
          userId: ctx.user.id,
        }
    );


  });
