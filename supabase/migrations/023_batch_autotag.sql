-- ═══════════════════════════════════════════════════════════
-- 023: Batch auto-tag tất cả từ vựng hiện có
-- Chạy 1 lần duy nhất để gắn tags cho 104 từ ban đầu
-- Rule: match keyword trên word + definition (case-insensitive)
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  w RECORD;
  new_tags TEXT[];
  matched BOOLEAN;
BEGIN
  FOR w IN SELECT id, word, definition FROM words LOOP
    new_tags := ARRAY[]::TEXT[];

    -- work
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'job|career|office|salary|employer|employee|meeting|project|deadline|client|manager|colleague|business trip|workplace|team|shift|overtime|position|internship|interview|application|candidate|recruit|staff|work')
    THEN new_tags := array_append(new_tags, 'work'); END IF;

    -- food
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'food|eat|restaurant|cook|meal|breakfast|lunch|dinner|recipe|ingredient|delicious|taste|flavor|dish|cuisine|appetite|hungry|thirsty|drink|cafe|baker|vegetable|fruit|meat|seafood|dessert|snack')
    THEN new_tags := array_append(new_tags, 'food'); END IF;

    -- health
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'health|doctor|hospital|medicine|sick|illness|disease|pain|treatment|patient|symptom|prescription|vaccine|clinic|pharmacy|exercise|fitness|body|blood|heart|lung|mental health|stress|insomnia|headache')
    THEN new_tags := array_append(new_tags, 'health'); END IF;

    -- travel
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'travel|trip|flight|hotel|tourist|airport|passport|vacation|destination|journey|abroad|overseas|tourism|backpack|itinerary|souvenir|visa|customs|immigration|luggage|baggage|checkin|boarding')
    THEN new_tags := array_append(new_tags, 'travel'); END IF;

    -- technology
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'computer|software|internet|online|app|device|digital|data|database|website|email|password|download|upload|browser|server|programming|code|wifi|screen|laptop|smartphone|tablet|robot|ai|cloud|cybersecurity|smart')
    THEN new_tags := array_append(new_tags, 'technology'); END IF;

    -- education
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'school|study|learn|teacher|student|exam|course|degree|university|college|classroom|lecture|homework|assignment|research|scholarship|tuition|curriculum|semester|grade|graduate|professor|diploma|learner')
    THEN new_tags := array_append(new_tags, 'education'); END IF;

    -- finance
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'money|bank|cost|price|pay|buy|sell|invest|profit|loss|budget|income|expense|tax|debt|loan|credit|insurance|stock|share|dividend|interest|mortgage|rent|payment|transaction|currency|dollar|asset|balance|affordable|wealth')
    THEN new_tags := array_append(new_tags, 'finance'); END IF;

    -- emotion
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'feel|happy|sad|angry|love|hate|fear|hope|dream|worry|stress|anxious|nervous|excited|bored|jealous|proud|shame|guilt|regret|relief|joy|passion|envy|compassion|gratitude|unhappy|passionate|enthusiastic')
    THEN new_tags := array_append(new_tags, 'emotion'); END IF;

    -- social
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'friend|party|community|neighbor|society|population|volunteer|charity|donate|immigrant|refugee|citizen|public|crowd|socialize|neighborhood|gathering|celebrate|celebration')
    THEN new_tags := array_append(new_tags, 'social'); END IF;

    -- nature
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'nature|environment|plant|tree|flower|forest|ocean|river|lake|mountain|desert|rain|climate|ecosystem|wildlife|conservation|pollution|recycle|sustainable|energy|green|landscape|scenery|land')
    THEN new_tags := array_append(new_tags, 'nature'); END IF;

    -- sports
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'sport|football|soccer|basketball|tennis|swim|gym|athlete|coach|stadium|championship|tournament|match|score|goal|referee|jogging|running|cycling|marathon|yoga|gymnastics|volleyball|baseball')
    THEN new_tags := array_append(new_tags, 'sports'); END IF;

    -- family
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'family|parent|mother|father|sibling|brother|sister|child|children|baby|grandparent|grandmother|grandfather|marriage|wedding|husband|wife|couple|daughter|son|relative|aunt|uncle|cousin|nephew|niece|twins|parents|maternal|paternal')
    THEN new_tags := array_append(new_tags, 'family'); END IF;

    -- business
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'business|company|enterprise|entrepreneur|startup|brand|marketing|advertising|customer|product|service|revenue|strategy|negotiate|contract|deal|partnership|franchise|corporate|ceo|executive|commercial|industry|sector')
    THEN new_tags := array_append(new_tags, 'business'); END IF;

    -- communication
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'communicate|communication|speak|speech|talk|converse|discuss|debate|present|presentation|negotiate|persuade|express|explain|describe|narrate|interview|lecture|convey|articulate|verbal|oral')
    THEN new_tags := array_append(new_tags, 'communication'); END IF;

    -- daily-life
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'routine|schedule|morning|afternoon|evening|night|habit|apartment|house|bedroom|bathroom|kitchen|laundry|clean|chore|errand|grocery|commute|driver|license|traffic|subway|bus|taxi|rideshare|appliance|household')
    THEN new_tags := array_append(new_tags, 'daily-life'); END IF;

    -- creative
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'art|music|paint|draw|design|creative|photography|fashion|style|craft|handmade|sculpture|gallery|museum|concert|band|song|lyrics|poem|dance|theater|film|movie|cinema|artistic|creative|imaginative|innovative')
    THEN new_tags := array_append(new_tags, 'creative'); END IF;

    -- science
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'science|research|experiment|hypothesis|theory|scientist|laboratory|lab|data|analysis|discovery|physics|chemistry|biology|mathematics|formula|equation|statistics|quantum|genetic|evolution|cell|organism|species|astronomy|scientific')
    THEN new_tags := array_append(new_tags, 'science'); END IF;

    -- law
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'law|legal|court|judge|lawyer|attorney|defendant|plaintiff|witness|evidence|verdict|trial|jury|crime|criminal|prison|jail|arrest|charge|bail|civil|rights|justice|statute|amendment|illegal|prosecutor')
    THEN new_tags := array_append(new_tags, 'law'); END IF;

    -- politics
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'politics|political|government|president|minister|parliament|congress|senate|election|vote|voter|campaign|policy|democracy|republic|monarchy|diplomatic|ambassador|treaty|voting|polls')
    THEN new_tags := array_append(new_tags, 'politics'); END IF;

    -- shopping
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'shop|store|buy|purchase|mall|market|supermarket|retail|sale|discount|coupon|checkout|cart|delivery|shipping|return|refund|brand|fashion|clothing|shoes|electronics|furniture|groceries|shopping|affordable|expensive|cheap|value')
    THEN new_tags := array_append(new_tags, 'shopping'); END IF;

    -- time
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'time|hour|minute|second|clock|watch|schedule|appointment|yesterday|today|tomorrow|weekday|weekend|month|year|decade|century|era|period|moment|instant|dawn|dusk|midnight|noon|afternoon|punctual|schedule')
    THEN new_tags := array_append(new_tags, 'time'); END IF;

    -- weather
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'weather|rain|sunny|cloudy|wind|storm|snow|hail|fog|temperature|humid|climate|forecast|typhoon|flood|drought|heatwave|breeze|thunder|lightning|umbrella|rainy|sunny|cloudy|humid|wet|dry')
    THEN new_tags := array_append(new_tags, 'weather'); END IF;

    -- animal
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'animal|pet|dog|cat|bird|fish|horse|cow|pig|chicken|sheep|goat|rabbit|wildlife|zoo|poultry|livestock|insect|butterfly|bee|spider|snake|tiger|creature|beast|mammal|pet')
    THEN new_tags := array_append(new_tags, 'animal'); END IF;

    -- place
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'city|town|village|country|state|province|region|capital|metropolitan|urban|rural|suburb|district|street|avenue|road|highway|bridge|park|square|building|station|museum|library|hospital|location|destination|residential|commercial')
    THEN new_tags := array_append(new_tags, 'place'); END IF;

    -- color
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'color|red|blue|green|yellow|orange|purple|pink|black|white|gray|brown|paint|shade|hue|tone|pigment|dye|rainbow|bright|dark|pale|vibrant')
    THEN new_tags := array_append(new_tags, 'color'); END IF;

    -- number
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'number|digit|integer|fraction|percentage|percent|decimal|sum|total|average|quantity|amount|count|figure|statistics|graph|chart|measurement|distance|height|weight|length|width|depth|rate|ratio')
    THEN new_tags := array_append(new_tags, 'number'); END IF;

    -- personality
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'personality|character|trait|behavior|temperament|attitude|introvert|extrovert|optimist|pessimist|confident|shy|generous|greedy|loyal|stubborn|humorous|serious|ambitious|reliable|brave|coward|honest|dishonest|friendly|outgoing|reserved')
    THEN new_tags := array_append(new_tags, 'personality'); END IF;

    -- relationship
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'relationship|friend|enemy|mentor|mentee|colleague|neighbor|partner|spouse|acquaintance|collaboration|cooperation|trust|betrayal|loyalty|friendship|associate|connection|link|bond|rapport')
    THEN new_tags := array_append(new_tags, 'relationship'); END IF;

    -- communication-type
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'tone|manner|etiquette|politeness|rudeness|formal|informal|slang|dialect|accent|vocabulary|body language|gesture|facial|intonation|pitch|volume|intonation')
    THEN new_tags := array_append(new_tags, 'communication-type'); END IF;

    -- abstract
    IF to_tsvector('simple', w.word || ' ' || COALESCE(w.definition, ''))
       @@ to_tsquery('simple', 'idea|concept|theory|philosophy|belief|value|principle|freedom|justice|peace|war|conflict|power|authority|responsibility|success|failure|purpose|meaning|existence|abstract|theoretical')
    THEN new_tags := array_append(new_tags, 'abstract'); END IF;

    -- Update tags (ensure never NULL)
    UPDATE words SET tags = COALESCE(new_tags, ARRAY[]::TEXT[]) WHERE id = w.id;

  END LOOP;
END $$;

-- Verify results
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE array_length(tags, 1) > 0) as tagged,
  AVG(array_length(tags, 1)) FILTER (WHERE array_length(tags, 1) > 0) as avg_tags_per_word
FROM words;
