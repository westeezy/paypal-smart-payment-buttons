/* @flow */

import { FUNDING } from '@paypal/sdk-constants';
import type { Wallet } from '../../src/types';

export type GetExperimentsParams = {|
    buttonSessionID : string,
    clientID : string,
    fundingSource : ?$Values<typeof FUNDING>,
    wallet : Wallet
|};

export type GetExperimentsType = {|
    enableVenmoAppLabel : boolean,
    isFundingSourceBranded : boolean
|};

export function getDefaultExperiments() : Promise<GetExperimentsType> {
    return Promise.resolve({
        enableVenmoAppLabel: false,
        isFundingSourceBranded: false
    });
}
