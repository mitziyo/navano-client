import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../enums/notice.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTopic: NoticeTopic;
	noticeTitle: string;
	noticeContent: string;
	noticeTeam?: string;
	noticeLink?: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation (admin) **/
	memberData?: Member;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
}

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeTopic?: NoticeTopic;
	noticeStatus?: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	noticeTeam?: string;
	noticeLink?: string;
}

export interface NoticeUpdate extends Partial<NoticeInput> {
	_id: string;
}
