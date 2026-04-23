import { supabase } from '../supabase'

/** Stats */
export async function getAdminStats() {
  const [wordsRes, topicsRes, usersRes, progressRes] = await Promise.all([
    supabase.from('words').select('id', { count: 'exact', head: true }),
    supabase.from('topics').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_srs_records').select('mastered'),
  ])

  const mastered = progressRes.data?.filter((p) => p.mastered).length ?? 0
  const total = progressRes.data?.length ?? 0

  return {
    totalWords: wordsRes.count ?? 0,
    totalTopics: topicsRes.count ?? 0,
    totalUsers: usersRes.count ?? 0,
    avgMastered: total > 0 ? Math.round((mastered / total) * 100) : 0,
  }
}

export async function getRecentWords(limit = 5) {
  const queryRes = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (queryRes.error || !queryRes.data) return queryRes

  const words = queryRes.data
  const wordIds = words.map(w => w.id)
  
  if (wordIds.length > 0) {
    const { data: junctions } = await supabase
      .from('topic_words')
      .select('word_id, topics(name)')
      .in('word_id', wordIds)

    const topicNameMap = new Map<string, string>()
    // PostgREST returns the joined relation as an array even for single rows
    type JunctionRow = { word_id: string; topics: Array<{ name: string }> | null }
    for (const j of (junctions ?? []) as JunctionRow[]) {
      topicNameMap.set(j.word_id, j.topics?.[0]?.name ?? '')
    }

    type WordWithTopic = typeof words[number] & { topics?: { name: string } }
    for (const w of words as WordWithTopic[]) {
      if (!w.topics) {
        w.topics = { name: topicNameMap.get(w.id) ?? '' }
      }
    }
  }

  return { data: words, error: null }
}
