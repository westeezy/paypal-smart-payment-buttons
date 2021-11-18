/* @flow */

export type GetExperimentsParams = {|
    buttonSessionID : string
|};

export type GetExperimentsType = {|
    enableVenmoAppLabel : boolean
|};

export function getDefaultExperiments() : Promise<GetExperimentsType> {
    return Promise.resolve({
        enableVenmoAppLabel: false
    });
}
