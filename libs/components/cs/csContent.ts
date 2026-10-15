// CS labels and contacts. Notices and FAQ come from the API (getNotices); the original static
// content was moved to navano/scripts/seed-cs.data.json. Every label is an i18n key, and the API
// texts are passed through t() as well, so the seeded English texts keep their translations.
import { InquiryType } from '../../enums/inquiry.enum';
import { NoticeTopic } from '../../enums/notice.enum';

export const NOTICE_CATEGORIES: { value: NoticeTopic; label: string }[] = [
	{ value: NoticeTopic.EVENT, label: 'Events' },
	{ value: NoticeTopic.POLICY, label: 'Policy' },
	{ value: NoticeTopic.UPDATE, label: 'Updates' },
];

export const FAQ_CATEGORIES: { value: NoticeTopic; label: string }[] = [
	{ value: NoticeTopic.PRODUCTS, label: 'Products' },
	{ value: NoticeTopic.BUYERS, label: 'For buyers' },
	{ value: NoticeTopic.STORES, label: 'For stores' },
	{ value: NoticeTopic.ACCOUNT, label: 'Account' },
	{ value: NoticeTopic.COMMUNITY, label: 'Community' },
];

export const INQUIRY_TYPES: { value: InquiryType; label: string }[] = [
	{ value: InquiryType.ORDER, label: 'Order or delivery' },
	{ value: InquiryType.PRODUCT, label: 'Product' },
	{ value: InquiryType.STORE, label: 'Store' },
	{ value: InquiryType.ACCOUNT, label: 'Account' },
	{ value: InquiryType.OTHER, label: 'Other' },
];

// Labels for topics that are not in the lists above (GENERAL, TERMS)
export const topicLabel = (topic: NoticeTopic): string =>
	[...NOTICE_CATEGORIES, ...FAQ_CATEGORIES].find((item) => item.value === topic)?.label ?? 'General';

export const CS_PHONE = '+82 10 4867 2909';
export const CS_PHONE_HREF = 'tel:+821048672909';
