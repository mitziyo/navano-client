import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeBoard from '../../../libs/components/admin/cs/NoticeBoard';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

const AdminFaq: NextPage = () => <NoticeBoard category={NoticeCategory.FAQ} />;

export default withAdminLayout(AdminFaq);
