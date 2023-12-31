import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t, useKresusState } from '../../../helpers';
import { get, actions } from '../../../store';
import {
    DARK_MODE,
    DISCOVERY_MODE,
    FLUID_LAYOUT,
    LIMIT_ONGOING_TO_CURRENT_MONTH,
} from '../../../../shared/settings';

import { Switch, Form } from '../../ui';
import AccountSelector from '../../ui/account-select';

import LocaleSelector from './locale-selector';

const CustomizationOptions = () => {
    const isDarkMode = useKresusState(state => get.boolSetting(state, DARK_MODE));
    const isFluidLayout = useKresusState(state => get.boolSetting(state, FLUID_LAYOUT));
    const isDiscoveryModeEnabled = useKresusState(state => get.boolSetting(state, DISCOVERY_MODE));
    const isOngoingLimitedToCurrentMonth = useKresusState(state =>
        get.boolSetting(state, LIMIT_ONGOING_TO_CURRENT_MONTH)
    );
    const defaultAccountId = useKresusState(state => get.defaultAccountId(state));

    const dispatch = useDispatch();

    const toggleDarkMode = useCallback(
        (checked: boolean) => {
            return actions.setDarkMode(dispatch, checked);
        },
        [dispatch]
    );
    const toggleFluidLayout = useCallback(
        (checked: boolean) => {
            return actions.setFluidLayout(dispatch, checked);
        },
        [dispatch]
    );
    const toggleDiscoveryMode = useCallback(
        (checked: boolean) => {
            return actions.setBoolSetting(dispatch, DISCOVERY_MODE, checked);
        },
        [dispatch]
    );
    const setIsOngoingLimitedToCurrentMonth = useCallback(
        (checked: boolean) => {
            return actions.setBoolSetting(dispatch, LIMIT_ONGOING_TO_CURRENT_MONTH, checked);
        },
        [dispatch]
    );

    const setDefaultAccount = useCallback(
        (id: number) => {
            const finalId = id === -1 ? null : id;
            return actions.setDefaultAccountId(dispatch, finalId);
        },
        [dispatch]
    );
    const defaultAccountKey = defaultAccountId === null ? -1 : defaultAccountId;

    return (
        <Form center={true}>
            <Form.Input
                label={$t('client.accesses.default_account')}
                id="default-account-selector"
                help={$t('client.accesses.default_account_helper')}>
                <AccountSelector
                    includeNone={true}
                    onChange={setDefaultAccount}
                    initial={defaultAccountKey}
                />
            </Form.Input>

            <Form.Input label={$t('client.settings.customization.locale')} id="locale-selector">
                <LocaleSelector className="form-element-block" />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.dark_mode')}
                id="dark-mode">
                <Switch
                    onChange={toggleDarkMode}
                    checked={isDarkMode}
                    ariaLabel={$t('client.settings.customization.dark_mode')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.fluid_layout')}
                help={$t('client.settings.customization.fluid_layout_help')}
                id="fluid-layout">
                <Switch
                    onChange={toggleFluidLayout}
                    checked={isFluidLayout}
                    ariaLabel={$t('client.settings.customization.fluid_layout')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.discovery_label')}
                id="discovery-mode">
                <Switch
                    onChange={toggleDiscoveryMode}
                    checked={isDiscoveryModeEnabled}
                    ariaLabel={$t('client.settings.customization.discovery_label')}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                label={$t('client.settings.customization.limit_ongoing_to_current_month')}
                id="discovery-mode">
                <Switch
                    onChange={setIsOngoingLimitedToCurrentMonth}
                    checked={isOngoingLimitedToCurrentMonth}
                    ariaLabel={$t('client.settings.customization.limit_ongoing_to_current_month')}
                />
            </Form.Input>
        </Form>
    );
};

CustomizationOptions.displayName = 'CustomizationOptions';

export default CustomizationOptions;
