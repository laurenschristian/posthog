import { connect, kea, key, path, props, selectors } from 'kea'

import { DataNodeLogicProps, dataNodeLogic } from '~/queries/nodes/DataNode/dataNodeLogic'
import { HogQLQueryResponse } from '~/queries/schema/schema-general'

import type { batchedBreakdownLogicType } from './batchedBreakdownLogicType'

export interface BreakdownPropertyData {
    label: string
    count: number
}

export interface BatchedBreakdownLogicProps {
    dataNodeLogicProps: DataNodeLogicProps
}

export const batchedBreakdownLogic = kea<batchedBreakdownLogicType>([
    path(['products', 'error_tracking', 'components', 'Breakdowns', 'batchedBreakdownLogic']),
    props({} as BatchedBreakdownLogicProps),
    key((props) => props.dataNodeLogicProps.key || 'default'),
    connect((props: BatchedBreakdownLogicProps) => ({
        values: [dataNodeLogic(props.dataNodeLogicProps), ['response', 'responseLoading']],
    })),
    selectors(() => ({
        breakdownsByProperty: [
            (s) => [s.response],
            (response): Record<string, BreakdownPropertyData[]> => {
                const result: Record<string, BreakdownPropertyData[]> = {}

                if (response && 'results' in response) {
                    const hogqlResponse = response as HogQLQueryResponse
                    hogqlResponse.results?.forEach((row: any[]) => {
                        // Row format: [breakdown_property, breakdown_value, count]
                        const property = row[0] as string
                        const value = row[1] as string
                        const count = row[2] as number

                        if (!result[property]) {
                            result[property] = []
                        }

                        result[property].push({
                            label: value,
                            count,
                        })
                    })
                }

                return result
            },
        ],
        totalCountByProperty: [
            (s) => [s.breakdownsByProperty],
            (breakdownsByProperty): Record<string, number> => {
                const result: Record<string, number> = {}

                Object.entries(breakdownsByProperty).forEach(([property, data]) => {
                    result[property] = data.reduce((sum, item) => sum + item.count, 0)
                })

                return result
            },
        ],
    })),
])
