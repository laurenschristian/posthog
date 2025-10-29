import { connect, kea, key, path, props, selectors } from 'kea'

import { DataNodeLogicProps, dataNodeLogic } from '~/queries/nodes/DataNode/dataNodeLogic'

import type { breakdownPreviewLogicType } from './breakdownPreviewLogicType'

export interface BreakdownSinglePropertyStat {
    label: string
    count: number
}

export interface BreakdownPreviewLogicProps {
    dataNodeLogicProps: DataNodeLogicProps
}

export const breakdownPreviewLogic = kea<breakdownPreviewLogicType>([
    path(['products', 'error_tracking', 'components', 'Breakdowns', 'breakdownPreviewLogic']),
    props({} as BreakdownPreviewLogicProps),
    key((props) => props.dataNodeLogicProps.key || 'default'),
    connect((props: BreakdownPreviewLogicProps) => ({
        values: [dataNodeLogic(props.dataNodeLogicProps), ['response', 'responseLoading']],
    })),
    selectors(() => ({
        properties: [
            (s) => [s.response],
            (response): BreakdownSinglePropertyStat[] => {
                const breakdownData: BreakdownSinglePropertyStat[] = []

                if (response && 'results' in response && Array.isArray(response.results)) {
                    response.results.forEach((result: any) => {
                        if (result.breakdown_value && result.count) {
                            breakdownData.push({
                                label: result.breakdown_value,
                                count: result.count,
                            })
                        }
                    })
                }

                return breakdownData
            },
        ],
        totalCount: [
            (s) => [s.response],
            (response): number => {
                if (
                    response &&
                    'results' in response &&
                    Array.isArray(response.results) &&
                    response.results.length > 0
                ) {
                    return response.results[0]?.total_count || 0
                }
                return 0
            },
        ],
    })),
])
