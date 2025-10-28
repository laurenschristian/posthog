import { useValues } from 'kea'

import { DataNodeLogicProps } from '~/queries/nodes/DataNode/dataNodeLogic'

import { errorTrackingIssueBatchedBreakdownQuery } from '../../queries'
import { errorTrackingIssueSceneLogic } from '../../scenes/ErrorTrackingIssueScene/errorTrackingIssueSceneLogic'
import { BreakdownsTileButton } from './BreakdownsTileButton'
import { batchedBreakdownLogic } from './batchedBreakdownLogic'
import { breakdownFiltersLogic } from './breakdownFiltersLogic'
import { BREAKDOWN_PRESETS, ERROR_TRACKING_BREAKDOWNS_DATA_COLLECTION_NODE_ID } from './consts'
import { errorTrackingBreakdownsLogic } from './errorTrackingBreakdownsLogic'

export function MiniBreakdowns(): JSX.Element {
    const { dateRange, filterTestAccounts } = useValues(breakdownFiltersLogic)
    const { issueId } = useValues(errorTrackingBreakdownsLogic)
    const { issue } = useValues(errorTrackingIssueSceneLogic)

    const batchedQuery = errorTrackingIssueBatchedBreakdownQuery({
        breakdownProperties: BREAKDOWN_PRESETS.map((p) => p.property),
        dateRange,
        filterTestAccounts,
        issueId,
    })

    const dataNodeLogicProps: DataNodeLogicProps = {
        query: batchedQuery,
        key: `BatchedBreakdowns.${issueId}`,
        dataNodeCollectionId: ERROR_TRACKING_BREAKDOWNS_DATA_COLLECTION_NODE_ID,
    }

    const { breakdownsByProperty, totalCountByProperty, responseLoading } = useValues(
        batchedBreakdownLogic({ dataNodeLogicProps })
    )

    if (!issue) {
        return <></>
    }

    return (
        <div className="border rounded bg-surface-primary overflow-hidden divide-y">
            {BREAKDOWN_PRESETS.map((item) => (
                <BreakdownsTileButton
                    key={item.property}
                    item={item}
                    properties={breakdownsByProperty[item.property] || []}
                    totalCount={totalCountByProperty[item.property] || 0}
                    loading={responseLoading}
                />
            ))}
        </div>
    )
}
