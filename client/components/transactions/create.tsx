import React, { useCallback, useContext, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../../store';
import MainURLs from '../../urls';
import {
    translate as $t,
    NONE_CATEGORY_ID,
    UNKNOWN_OPERATION_TYPE,
    displayLabel,
    notify,
    assert,
} from '../../helpers';

import CategorySelect from '../reports/category-select';
import TypeSelect from '../reports/type-select';

import AmountInput from '../ui/amount-input';
import DisplayIf from '../ui/display-if';
import ValidatedDatePicker from '../ui/validated-date-picker';
import ValidatedTextInput from '../ui/validated-text-input';
import { BackLink, Form } from '../ui';
import { ViewContext } from '../drivers';
import { useHistory } from 'react-router-dom';
import { RedirectIfNotAccount } from '../../main';

const CreateTransaction = () => {
    const history = useHistory();
    const view = useContext(ViewContext);

    const account = view.account;
    assert(account !== null, 'account is set');

    const [date, setDate] = useState<Date | undefined | null>();
    const [label, setLabel] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | undefined>(NONE_CATEGORY_ID);
    const [type, setType] = useState<string>(UNKNOWN_OPERATION_TYPE);

    const handleSetCategoryId = useCallback(
        (newVal: number | null) => {
            // Normalize null into undefined.
            setCategoryId(newVal === null ? undefined : newVal);
        },
        [setCategoryId]
    );

    const dispatch = useDispatch();
    const onSubmit = useCallback(async () => {
        assert(typeof date !== 'undefined' && date !== null, 'date is set');
        assert(label !== null, 'label is set');
        assert(amount !== null, 'amount is set');
        try {
            await actions.createOperation(dispatch, {
                date,
                label,
                amount,
                categoryId,
                type,
                accountId: account.id,
            });
            history.push(MainURLs.reports.url(view.driver));
        } catch (err) {
            notify.error(err.message);
        }
    }, [view.driver, dispatch, history, date, label, amount, categoryId, type, account]);

    const accountLabel = displayLabel(account);
    const allowSubmit = date && label && label.trim().length && amount && !Number.isNaN(amount);
    const reportUrl = MainURLs.reports.url(view.driver);

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={reportUrl}>{$t('client.operations.back_to_report')}</BackLink>

            <h3>
                {$t('client.addoperation.add_operation', {
                    account: accountLabel,
                })}
            </h3>

            <p>
                {$t('client.addoperation.description', {
                    account: accountLabel,
                })}
            </p>

            <DisplayIf condition={account.vendorId !== 'manual'}>
                <p className="alerts warning">{$t('client.addoperation.warning')}</p>
            </DisplayIf>

            <Form.Input id="date" label={$t('client.addoperation.date')}>
                <ValidatedDatePicker
                    onSelect={setDate}
                    value={date}
                    className="block"
                    clearable={true}
                />
            </Form.Input>

            <Form.Input id="type" label={$t('client.addoperation.type')}>
                <TypeSelect onChange={setType} value={type} />
            </Form.Input>

            <Form.Input id="label" label={$t('client.addoperation.label')}>
                <ValidatedTextInput id={`label${account.id}`} onChange={setLabel} />
            </Form.Input>

            <Form.Input id="amount" label={$t('client.addoperation.amount')}>
                <AmountInput
                    signId={`sign${account.id}`}
                    onChange={setAmount}
                    checkValidity={true}
                    className="block"
                />
            </Form.Input>

            <Form.Input id="category" label={$t('client.addoperation.category')}>
                <CategorySelect onChange={handleSetCategoryId} value={categoryId} />
            </Form.Input>

            <button className="btn success" type="submit" disabled={!allowSubmit}>
                {$t('client.addoperation.submit')}
            </button>
        </Form>
    );
};

CreateTransaction.displayName = 'CreateTransaction';

export default () => {
    return (
        <RedirectIfNotAccount>
            <CreateTransaction />
        </RedirectIfNotAccount>
    );
};
