import { Trans } from '@lingui/react/macro';
import { Link } from 'react-router';

import { SUPPORT_EMAIL } from '@documenso/lib/constants/app';
import { getSiteSettings } from '@documenso/lib/server-only/site-settings/get-site-settings';
import { SITE_SETTINGS_PRIVACY_POLICY_ID } from '@documenso/lib/server-only/site-settings/schemas/privacy-policy';
import { Button } from '@documenso/ui/primitives/button';

// Types will be generated during build
// import type { Route } from './+types/articles.privacy-policy';
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

// Default privacy policy content to use as fallback if no content is found in the database
// or if the privacy policy setting is disabled
const DEFAULT_PRIVACY_POLICY = `
<h1>Privacy Policy</h1>

<h2>Introduction</h2>
<p>
  Welcome to Clickesignature. We respect your privacy and are committed to protecting your personal data.
  This privacy policy will inform you about how we look after your personal data when you visit our
  website and tell you about your privacy rights and how the law protects you.
</p>

<h2>Data We Collect</h2>
<p>
  We may collect, use, store and transfer different kinds of personal data about you which we have
  grouped together as follows:
</p>
<ul>
  <li>Identity Data: includes first name, last name, username or similar identifier</li>
  <li>Contact Data: includes email address and telephone numbers</li>
  <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</li>
  <li>Usage Data: includes information about how you use our website, products and services</li>
</ul>

<h2>How We Use Your Data</h2>
<p>
  We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
</p>
<ul>
  <li>To register you as a new customer</li>
  <li>To process and deliver your service including managing payments</li>
  <li>To manage our relationship with you including notifying you about changes to our terms or privacy policy</li>
  <li>To administer and protect our business and this website</li>
</ul>

<h2>Data Security</h2>
<p>
  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
</p>

<h2>Data Retention</h2>
<p>
  We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
</p>

<h2>Your Legal Rights</h2>
<p>
  Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
</p>
<ul>
  <li>Request access to your personal data</li>
  <li>Request correction of your personal data</li>
  <li>Request erasure of your personal data</li>
  <li>Object to processing of your personal data</li>
  <li>Request restriction of processing your personal data</li>
  <li>Request transfer of your personal data</li>
  <li>Right to withdraw consent</li>
</ul>

<h2>Cookies</h2>
<p>
  We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier.
</p>

<h2>Changes to This Privacy Policy</h2>
<p>
  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
</p>

<h2>Contact Us</h2>
<p>
  If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
</p>
`;

export async function loader() {
  const settings = await getSiteSettings();
  const privacyPolicy = settings.find((setting) => setting.id === SITE_SETTINGS_PRIVACY_POLICY_ID);

  return { privacyPolicy };
}

export default function PrivacyPolicy({ loaderData }: ComponentProps) {
  const { privacyPolicy } = loaderData;

  // Use the content from the database if the privacy policy setting is enabled and has content
  // Otherwise, use the default content
  const content = privacyPolicy?.enabled && privacyPolicy?.data?.content
    ? privacyPolicy.data.content
    : DEFAULT_PRIVACY_POLICY;

  return (
    <div>
      <article
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-8">
        <Button asChild>
          <Link to="/">
            <Trans>Back home</Trans>
          </Link>
        </Button>
      </div>
    </div>
  );
}
