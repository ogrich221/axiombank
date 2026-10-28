export type BankPage = { title: string; category: string; description: string; image?: 'building' | 'desk'; sections: { title: string; body: string; items?: string[] }[]; kind?: 'help' | 'contact' | 'fees' | 'cookies' | 'login'; draft?: boolean };
export const bankPages = {
  'personal-banking': { title: 'Personal Banking', category: 'Your everyday', description: 'One clear place for your everyday money, savings, cards and next steps.', image: 'desk', sections: [
    { title: 'An account built around your day', body: 'Receive income, manage payments and review account activity with an Everyday Account. Keep available funds and pending transactions easy to distinguish.', items: ['Everyday Account: $0 monthly maintenance fee', 'No minimum balance requirement', 'No overdraft fee; payments may be declined if funds are insufficient'] },
    { title: 'Move money with clarity', body: 'Review the recipient, amount, exchange rate and any applicable fee before confirming a transfer. Delivery depends on the destination, receiving institution and required checks.', items: ['Domestic and international transfers', 'Transaction history and payment receipts', 'Support for payment questions and unexpected activity'] },
    { title: 'Before you apply', body: 'Prepare a government-issued identity document, contact details and proof of residence. Identity verification and approval are required. Residents of the 54 countries listed on the homepage can apply; African countries are not currently eligible.' }
  ] },
  savings: { title: 'Smart Savings', category: 'Plan ahead', description: 'Give your goals a place of their own, with a clear view of how your savings are growing.', sections: [
    { title: 'Save toward what matters', body: 'Separate money for emergencies, travel, a home or a personal milestone. Name your goals and review progress without losing sight of everyday spending.', items: ['Organize savings by goal', 'Set a regular savings amount', 'Review contributions and withdrawals'] },
    { title: 'Understand your return', body: 'The indicative savings rate is 4.10% annual percentage yield (APY). This is a draft rate, not a current offer. Rates may vary and must be confirmed in the account agreement before opening.', items: ['APY reflects the effect of compounding over a year', 'Variable rates can change', 'Eligibility, currency and account terms affect availability'] },
    { title: 'Keep your savings accessible', body: 'Check available funds before moving money back to your everyday account. Transfer timing, withdrawal conditions and applicable charges will be stated in your account terms.' }
  ], draft: true },
  cards: { title: 'AXIOM Cards', category: 'Spend with confidence', description: 'Everyday payments, clear activity and card controls that put you in charge.', sections: [
    { title: 'A card for everyday life', body: 'Use your eligible debit card for purchases online and in person, subject to your available balance, card limits and merchant acceptance.', items: ['Review purchases and pending authorizations', 'Manage online and international payment settings', 'Check the final amount and currency before paying'] },
    { title: 'Stay in control', body: 'Freeze a misplaced card, review recent transactions and contact support if a payment looks unfamiliar. Freezing a card may not stop transactions already authorized or recurring charges.', items: ['Freeze and unfreeze your card', 'Manage spending limits and PIN settings', 'Request help with a lost, stolen or damaged card'] },
    { title: 'Travel and cash withdrawals', body: 'Indicative pricing includes a 0% foreign card transaction fee and a $2.50 out-of-network ATM fee. ATM operators may charge separately, and currency conversion may affect the total. Confirm the fee schedule before using your card abroad.' }
  ], draft: true },
  'spending-insights': { title: 'Spending Insights', category: 'See the full picture', description: 'Turn everyday activity into a clearer understanding of your money.', sections: [
    { title: 'Understand where your money goes', body: 'Review spending by category and compare activity across periods. Pending payments, transfers and refunds can affect your totals.', items: ['Everyday categories such as groceries, transport and shopping', 'Monthly activity summaries', 'Searchable transaction records'] },
    { title: 'Make room for your priorities', body: 'Use patterns in your activity to plan a practical budget. Separate fixed commitments from flexible spending, then decide how much to set aside for savings.' },
    { title: 'Know the limits of an insight', body: 'Categories are informational and can be imperfect. Always use your account statement to verify settled transactions. Spending summaries are not investment, tax or financial advice.' }
  ] },
  about: { title: 'About AXIOM BANK', category: 'Transparent by Design', description: 'Banking should be understandable, personal and built on trust.', image: 'building', sections: [
    { title: 'Clarity is our starting point', body: 'AXIOM BANK is built around a simple belief: you should understand what happens to your money. Clear information, straightforward language and practical tools guide the experience.' },
    { title: 'People behind the banking', body: 'Everyday questions deserve human answers. Our approach combines digital access with a support team that helps explain account activity, card issues and the next step in an application.' },
    { title: 'An international outlook', body: 'The proposed service covers residents of 54 countries across the Americas, Europe, Asia and Oceania. Residents of African countries are not currently eligible. Product access remains subject to verification and local requirements.' }
  ] },
  'our-approach': { title: 'Our Approach', category: 'A clearer standard', description: 'Straightforward information. Thoughtful protection. More control over everyday money.', sections: [
    { title: 'Explain before you commit', body: 'Charges, conditions and important decisions should be presented before you confirm. We aim to make information easy to compare, without burying the essentials in complex language.' },
    { title: 'Make control practical', body: 'Useful tools start with everyday needs: checking activity, managing a card, setting savings goals and finding help. Simplicity means removing unnecessary friction, not removing important detail.' },
    { title: 'Treat trust as a responsibility', body: 'Security, privacy and customer support belong at the center of banking. We aim to communicate promptly about account issues and explain what you can do next.' }
  ] },
  careers: { title: 'Careers at AXIOM', category: 'Build with purpose', description: 'Help make banking clearer, safer and more human.', image: 'desk', sections: [
    { title: 'The work that matters', body: 'Our areas of focus include customer experience, engineering, product design, operations, risk and compliance. We value careful decisions, clear communication and respect for customers.' },
    { title: 'What we look for', body: 'Bring curiosity, sound judgment and a willingness to collaborate. Financial services experience may be relevant for specialist roles, while customer empathy matters across every team.' },
    { title: 'Current opportunities', body: 'No verified vacancies are published at this time. Contact the team to ask about future opportunities. Never send passport details, banking credentials or sensitive identity documents with a career inquiry.' }
  ] },
  contact: { title: 'Contact AXIOM', category: 'Talk to our team', description: 'Reach the right place for account questions, card concerns and general inquiries.', kind: 'contact', draft: true, sections: [
    { title: 'Account and card support', body: 'For a missing card or unfamiliar payment, use the official support channel once your account is active. Never share your password, full card number, PIN or a one-time security code by email.' },
    { title: 'General inquiries', body: 'Include a brief description of your question and the best way to reach you. For a payment question, avoid sending sensitive account information in an ordinary email.' },
    { title: 'Complaints and follow-up', body: 'Tell the team what happened, when it happened and the outcome you are seeking. Keep any reference number so you can follow up. Regulatory escalation details must be confirmed in the final account agreement.' }
  ] },
  'help-center': { title: 'Help Center', category: 'Here when you need us', description: 'Find clear answers about getting started, payments, cards and account security.', kind: 'help', sections: [
    { title: 'Getting started', body: 'Prepare your identity document and residence details. Complete the required checks before an account can be approved. Availability depends on your country and the product.' },
    { title: 'Payments and transfers', body: 'Check the recipient details and payment status first. A pending payment may still be processing. If details are incorrect, contact support promptly; a completed transfer may not be reversible.' },
    { title: 'Cards and account access', body: 'If a card is missing, freeze it through the official banking service and contact support. If you cannot sign in, use the official recovery process; never give your security codes to someone offering to help.' },
    { title: 'Unexpected activity', body: 'Review the merchant name and date. If you still do not recognize a payment, contact support immediately and keep a record of the transaction. Do not wait for another suspicious transaction.' }
  ] },
  faq: { title: 'Frequently Asked Questions', category: 'Answers, without the guesswork', description: 'The essentials about accounts, eligibility, fees and support.', kind: 'help', sections: [
    { title: 'What makes AXIOM different?', body: 'Our focus is clear information, practical tools and a banking experience designed around everyday needs.' },
    { title: 'Is there a monthly account fee?', body: 'The indicative Everyday Account monthly fee is $0, with no minimum balance and no overdraft fee. Other charges can apply; review the separate fee schedule.' },
    { title: 'Who can apply?', body: 'Residents of the 54 countries listed on the homepage can apply, subject to identity verification, local requirements and approval. African countries are not currently eligible.' },
    { title: 'How long does an application take?', body: 'The proposed application takes about 10 minutes, with an indicative review period of one business day. Additional checks may take longer. These timings are not a guarantee.' },
    { title: 'Can I manage a lost card?', body: 'Use the official banking service to freeze a card and contact support for replacement options. If you suspect fraud, report it promptly.' },
    { title: 'How does AXIOM BANK protect my funds?', body: 'All eligible customer deposits are held in segregated, highly regulated partner accounts with strict reserve requirements and bank-grade data encryption.' }
  ] },
  security: { title: 'Security & Protection', category: 'Trust comes first', description: 'Practical protection starts with careful systems and informed customers.', sections: [
    { title: 'Protect your access', body: 'Use a unique password, enable available multi-factor authentication and keep your devices updated. Never approve a sign-in request you did not initiate.', items: ['Never share your PIN or one-time security codes', 'Avoid signing in through unsolicited links', 'Use trusted networks and devices'] },
    { title: 'Recognize suspicious contact', body: 'A caller, email or message can imitate a bank. Do not move money to a “safe account” or install remote-access software at someone’s request. Independently verify the official contact channel.' },
    { title: 'Act when something looks wrong', body: 'Freeze a missing card, review activity and report unfamiliar payments promptly. Preserve relevant messages and transaction details. For immediate personal danger, contact local emergency services.' },
    { title: 'Our security commitments', body: 'End-to-end encryption, multi-factor authentication and continuous fraud monitoring protect your accounts 24/7.' }
  ] },
  accessibility: { title: 'Accessibility', category: 'Banking for everyone', description: 'A clear experience should be usable by people with different needs and abilities.', sections: [
    { title: 'Our aim', body: 'We aim for readable content, clear labels, keyboard access and layouts that work at different screen sizes. Accessibility is an ongoing responsibility, not a one-time claim.' },
    { title: 'Alternative support', body: 'If a page or document prevents you from accessing information, contact the team and describe the information you need and your preferred format. Avoid sending sensitive medical or financial details.' },
    { title: 'Report an access barrier', body: 'Include the page address, the task you were attempting and the device or assistive technology involved, if you are comfortable sharing it. We will use this information to identify improvements.' }
  ] },
  privacy: { title: 'Privacy Policy', category: 'Your information', description: 'A draft explanation of how information may be used and the choices you should have.', draft: true, sections: [
    { title: 'Information and purpose', body: 'A banking service may need identity, contact, residence and transaction information to provide accounts, verify applicants, prevent fraud and meet legal obligations. Only necessary information should be collected for a stated purpose.' },
    { title: 'Sharing and retention', body: 'Information may be shared with service providers, payment networks and authorities where necessary and lawful. Retention periods depend on account, security and regulatory requirements. Final recipients and periods require confirmation.' },
    { title: 'Your rights', body: 'Depending on applicable law, you may request access, correction, deletion or restrictions on processing. Some records must be kept for legal reasons. Identity verification may be required before responding to a request.' },
    { title: 'Contact and updates', body: 'Contact the team with privacy questions or requests. The final policy must identify the legal entity, privacy contact, applicable jurisdictions and effective date before the banking service launches.' }
  ] },
  terms: { title: 'Terms and Conditions', category: 'The account agreement', description: 'Draft terms outlining the main responsibilities and conditions of a banking relationship.', draft: true, sections: [
    { title: 'Eligibility and account opening', body: 'An application is not a guarantee of approval. Applicants must meet residence, identity and applicable legal requirements. Products and currencies can differ by jurisdiction.' },
    { title: 'Using an account', body: 'Keep contact details accurate and credentials private. Payments depend on available funds, transaction limits, recipient accuracy and required checks. Never use an account for unlawful activity.' },
    { title: 'Charges, changes and closure', body: 'Applicable charges belong in the account fee schedule. Notice periods, suspension rights, closure procedures and treatment of remaining funds must be stated in the final agreement.' },
    { title: 'Disputes and governing law', body: 'The final terms must define complaint procedures, liability, dispute resolution, governing law and the contracting bank entity. This draft is not a binding account agreement or legal advice.' }
  ] },
  fees: { title: 'Fee Schedule', category: 'Know what you pay', description: 'Indicative pricing in one place, separate from the homepage.', kind: 'fees', draft: true, sections: [
    { title: 'Before you confirm', body: 'Review the total amount, applicable fees and exchange rate before authorizing a transaction. Third-party charges can apply in addition to the fees shown here.' },
    { title: 'Currency and third-party costs', body: 'Indicative amounts below are in USD. Receiving institutions, intermediaries and ATM operators may apply their own charges. Foreign exchange rates and product availability require confirmation.' },
    { title: 'Changes to pricing', body: 'Final pricing and required notice periods must be set out in the account agreement. Contact the team for verified rates before relying on this draft.' }
  ] },
  'cookie-preferences': { title: 'Cookie Preferences', category: 'Your browsing choices', description: 'Understand essential browser storage and optional cookies.', kind: 'cookies', sections: [
    { title: 'Essential storage', body: 'Essential browser storage supports basic website operation. It is not used here to process banking transactions or authenticate an account.' },
    { title: 'Optional cookies', body: 'No optional analytics or advertising cookies have been configured by this website. Both categories remain off. If optional services are introduced, a consent control will be required before they are activated.' },
    { title: 'Browser controls', body: 'Your browser can clear cookies and site data or block storage. Doing so may remove settings or affect functionality. For information about personal data, review the privacy policy.' }
  ] },
  disclosures: { title: 'Regulatory Disclosures', category: 'Important information', description: 'Verify the legal entity, licensing and deposit protection before making a financial decision.', draft: true, sections: [
    { title: 'Bank identity and licensing', body: 'The displayed AXIOM BANK, N.A. name, New York address and NMLS ID #2489105 are unverified placeholders. They must not be treated as evidence of registration, authorization or a regulated banking relationship.' },
    { title: 'Deposit protection', body: 'References on this site to FDIC membership and $250,000 protection are draft claims that require verification. Actual coverage depends on the insured institution, depositor, ownership category and account structure. Non-US customers should not assume US protection applies.' },
    { title: 'International availability', body: 'The proposed eligible-country list is not proof of local authorization. Products, currency support, consumer protection and tax obligations can vary. Final jurisdiction-specific disclosures are required.' },
    { title: 'No offer or financial advice', body: 'This website is draft informational content, not a binding offer, an investment recommendation or evidence of an active banking service. Confirm all rates, fees and legal details before use.' }
  ] },
  login: { title: 'Account Access', category: 'Secure banking', description: 'Access your AXIOM online banking account securely.', kind: 'login', sections: [
    { title: 'Secure online banking', body: 'Manage your accounts, review real-time balances, initiate transfers, and manage cards with bank-grade security.' },
    { title: 'Need help signing in?', body: 'Visit our Help Center or use the password recovery link on the sign-in page to reset your access.' }
  ] }
} satisfies Record<string, BankPage>;
export type BankPageKey = keyof typeof bankPages;
export function bankPageHead(key: BankPageKey) {
  const page = bankPages[key];
  return { meta: [{ title: `${page.title} — AXIOM BANK` }, { name: 'description', content: page.description }, { property: 'og:title', content: `${page.title} — AXIOM BANK` }, { property: 'og:description', content: page.description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
