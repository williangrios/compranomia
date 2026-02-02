// src/utils/typeGuards/isUserTag.ts
import { UserTags } from '@wrcb/cb-common'

export function isUserTag(tag: unknown): tag is UserTags {
  return Object.values(UserTags).includes(tag as UserTags)
}
