import { useQuery } from '@apollo/client'
import Timeline from '@components/Home/Timeline'
import TimelineShimmer from '@components/Shimmers/TimelineShimmer'
import { Loader } from '@components/UIElements/Loader'
import { NoDataFound } from '@components/UIElements/NoDataFound'
import { PROFILE_FEED_QUERY } from '@gql/queries'
import logger from '@lib/logger'
import {
  LENS_CUSTOM_FILTERS,
  LENSTUBE_APP_ID,
  LENSTUBE_BYTES_APP_ID
} from '@utils/constants'
import React, { FC, useState } from 'react'
import { useInView } from 'react-cool-inview'
import { PaginatedResultInfo, Profile, PublicationTypes } from 'src/types'
import { LenstubePublication } from 'src/types/local'

type Props = {
  channel: Profile
}

const request = {
  publicationTypes: [PublicationTypes.Comment],
  limit: 16,
  sources: [LENSTUBE_APP_ID, LENSTUBE_BYTES_APP_ID],
  customFilters: LENS_CUSTOM_FILTERS
}

const CommentedVideos: FC<Props> = ({ channel }) => {
  const [channelVideos, setChannelVideos] = useState<LenstubePublication[]>([])
  const [pageInfo, setPageInfo] = useState<PaginatedResultInfo>()
  const { data, loading, error, fetchMore } = useQuery(PROFILE_FEED_QUERY, {
    variables: {
      request: {
        ...request,
        profileId: channel?.id
      }
    },
    skip: !channel?.id,
    onCompleted(data) {
      setPageInfo(data?.publications?.pageInfo)
      setChannelVideos(data?.publications?.items)
    }
  })
  const { observe } = useInView({
    rootMargin: '1000px 0px',
    onEnter: async () => {
      try {
        const { data } = await fetchMore({
          variables: {
            request: {
              ...request,
              profileId: channel?.id,
              cursor: pageInfo?.next
            }
          }
        })
        setPageInfo(data?.publications?.pageInfo)
        setChannelVideos([...channelVideos, ...data?.publications?.items])
      } catch (error) {
        logger.error('[Error Fetch Commented Videos]', error)
      }
    }
  })

  if (loading) return <TimelineShimmer />

  if (data?.publications?.items?.length === 0) {
    return <NoDataFound isCenter withImage text="No comments on videos" />
  }

  return (
    <div className="w-full">
      {!error && !loading && (
        <div>
          <Timeline videos={channelVideos} videoType="Comment" />
          {pageInfo?.next && channelVideos.length !== pageInfo?.totalCount && (
            <span ref={observe} className="flex justify-center p-10">
              <Loader />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default CommentedVideos
