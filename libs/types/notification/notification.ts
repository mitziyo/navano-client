import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface Notification {
	_id: string;
	notificationType: NotificationType;
	notificationStatus: NotificationStatus;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: string;
	productId?: string;
	articleId?: string;
	createdAt: Date;
	/** from aggregation **/
	authorData?: Member;
}

export interface Notifications {
	list: Notification[];
	metaCounter: TotalCounter[];
}
