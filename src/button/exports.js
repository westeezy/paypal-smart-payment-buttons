/* @flow */


import { ZalgoPromise } from 'zalgo-promise/src';
import { querySelectorAll } from 'belter/src';

import { DATA_ATTRIBUTES } from '../constants';
import { upgradeFacilitatorAccessToken, getGuestEnabledStatus } from '../api';
import { getLogger, getBuyerAccessToken } from '../lib';

import type { ButtonProps } from './props';

type ExportsProps = {|
    props : ButtonProps,
    isEnabled : () => boolean,
    facilitatorAccessToken : string,
    fundingEligibility : Object,
    merchantID : $ReadOnlyArray<string>
|};

export function setupExports({ props, isEnabled, facilitatorAccessToken, fundingEligibility, merchantID } : ExportsProps)  {
    const { createOrder, onApprove, onError, onCancel, onClick, commit, intent, fundingSource, currency } = props;

    const fundingSources = querySelectorAll(`[${ DATA_ATTRIBUTES.FUNDING_SOURCE }]`).map(el => {
        return el.getAttribute(DATA_ATTRIBUTES.FUNDING_SOURCE);
    }).filter(Boolean);
    
    window.exports = {
        name:           'smart-payment-buttons',
        commit: {
            commit,
            currency,
            intent
        },
        currency,
        intent,
        isGuestEnabled: () => { return fundingEligibility?.card?.hasOwnProperty('guestEnabled') ? fundingEligibility.card.guestEnabled : getGuestEnabledStatus(merchantID); },
        paymentSession: () => {
            return {
                getAvailableFundingSources: () => fundingSources,
                createOrder:                () => {

                    if (!isEnabled()) {
                        throw new Error('Error occurred. Button not enabled.');
                    }

                    return ZalgoPromise.hash({
                        valid: onClick && fundingSource ? onClick({ fundingSource }) : true
                    }).then(({ valid }) => {
                        if (!valid) {
                            throw new Error('Error occurred during async validation');
                        } else {
                            return createOrder();
                        }
                    });


                },
                onApprove: (merchantData) => {
                    const data = {
                        payerID:      merchantData.payerID,
                        forceRestAPI: true
                    };

                    const actions = {
                        restart: () => {
                            throw new Error('Action unimplemented');
                        }
                    };

                    return onApprove(data, actions);
                },
                onCancel,
                onError,
                upgradeFacilitatorAccessToken: ({ facilitatorAccessToken: merchantAccessToken, orderID }) => {
                    const buyerAccessToken = getBuyerAccessToken();
                    
                    if (!buyerAccessToken) {
                        getLogger().error('lsat_upgrade_error', { err: 'buyer access token not found' });
                        throw new Error('Buyer access token not found');
                    }

                    return upgradeFacilitatorAccessToken(merchantAccessToken, { buyerAccessToken, orderID });
                },
                getFacilitatorAccessToken: () => {
                    return facilitatorAccessToken;
                }
            };
        }
    };
    
}


