import { useActions, useValues } from 'kea'

import { Spinner } from '@posthog/lemon-ui'

import { cn } from 'lib/utils/css-classes'

import { errorTrackingIssueSceneLogic } from '../../scenes/ErrorTrackingIssueScene/errorTrackingIssueSceneLogic'
import { BreakdownsStackedBar } from './BreakdownsStackedBar'
import { BreakdownPropertyData } from './batchedBreakdownLogic'
import { BreakdownPreset, POSTHOG_BREAKDOWN_NULL_VALUE } from './consts'
import { errorTrackingBreakdownsLogic } from './errorTrackingBreakdownsLogic'

interface BreakdownsTileButtonProps {
    item: BreakdownPreset
    properties: BreakdownPropertyData[]
    totalCount: number
    loading: boolean
}

export function BreakdownsTileButton({
    item,
    properties,
    totalCount,
    loading,
}: BreakdownsTileButtonProps): JSX.Element {
    const { breakdownProperty } = useValues(errorTrackingBreakdownsLogic)
    const { setBreakdownProperty } = useActions(errorTrackingBreakdownsLogic)
    const { category } = useValues(errorTrackingIssueSceneLogic)
    const { setCategory } = useActions(errorTrackingIssueSceneLogic)

    const isSelected = category === 'breakdowns' && breakdownProperty === item.property
    const hasOnlyNullBreakdown = properties.length === 1 && properties[0].label === POSTHOG_BREAKDOWN_NULL_VALUE

    return (
        <button
            onClick={() => {
                setBreakdownProperty(item.property)
                setCategory('breakdowns')
            }}
            className={cn(
                'w-full px-2.5 py-2 text-left border-l-[3px] cursor-pointer',
                isSelected ? 'border-l-brand-yellow' : 'border-l-transparent'
            )}
        >
            <div className="flex items-center gap-2">
                <div className="font-semibold text-xs w-[30%]">{item.title}</div>
                <div className="w-[70%]">
                    {loading ? (
                        <div className="h-4 flex items-center justify-center">
                            <Spinner className="text-xs" />
                        </div>
                    ) : properties.length === 0 || hasOnlyNullBreakdown ? (
                        <div className="text-muted text-xs h-4 flex items-center justify-center">No data</div>
                    ) : (
                        <BreakdownsStackedBar
                            properties={properties}
                            totalCount={totalCount}
                            propertyName={item.property}
                        />
                    )}
                </div>
            </div>
        </button>
    )
}
