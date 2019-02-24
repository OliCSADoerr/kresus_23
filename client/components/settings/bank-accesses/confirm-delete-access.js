import React from 'react';
import { connect } from 'react-redux';

import { displayLabel, translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import { registerModal } from '../../ui/modal';
import ModalContent from '../../ui/modal/content';
import CancelAndDelete from '../../ui/modal/cancel-and-delete-buttons';

export const DELETE_ACCESS_MODAL_SLUG = 'confirm-delete-access';

const ConfirmDeleteModal = connect(
    state => {
        let accessId = get.modal(state).state;
        let access = get.accessById(state, accessId);
        let title = access ? access.title : null;
        let customLabel = access ? access.customLabel : null;
        return {
            title,
            customLabel,
            accessId
        };
    },

    dispatch => {
        return {
            deleteAccess(accessId) {
                actions.deleteAccess(dispatch, accessId);
            }
        };
    },

    ({ title, customLabel, accessId }, { deleteAccess }) => {
        return {
            title,
            customLabel,
            handleDelete() {
                deleteAccess(accessId);
            }
        };
    }
)(props => {
    return (
        <ModalContent
            title={$t('client.confirmdeletemodal.title')}
            body={$t('client.settings.erase_access', { name: displayLabel(props) })}
            footer={<CancelAndDelete onDelete={props.handleDelete} />}
        />
    );
});

registerModal(DELETE_ACCESS_MODAL_SLUG, () => <ConfirmDeleteModal />);
