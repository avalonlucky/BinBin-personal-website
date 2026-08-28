var e=`---
title: "Cat Meme Hall of Fame"
date: "2026-06-26"
description: "A feed-fluent field guide to cat meme formats, internet voice, remix logic, and why MDX makes a tiny topic feel like a real presentation system."
---

import {
  CoverSlide,
  SectionSlide,
  StatementSlide,
  SplitHalf,
  HeroBento,
  MediaTrio,
  StatBento,
  Collage,
  QuoteSlide,
  QuoteWithMedia,
  SplitWithStat,
  TextLead,
  TimelineBento,
  FullBleedSlide,
  FullBleedGallery,
  ImageDuoSlide,
  ClosingSlide,
} from "@atom63/slides";
import { TalkTrack, Section } from "@atom63/slides";
import {
  Grid,
  Cell,
  Subtitle,
  Body,
  Display,
  Label,
  Stack,
  Columns,
  Trio,
  List,
  Item,
  Badge,
} from "@atom63/slides";

<CoverSlide
  credit="You Zhang · ATOM63"
  eyebrow="2026 · internet voice test"
  subtitle="an MDX-powered field guide to the cats that quietly run the feed"
  title="Cat Meme Hall of Fame"
/>

<TalkTrack>
  Open with the real premise: this is not only a cat deck. It is a demo of how
  fast a coded MDX slide system can turn internet culture into a paced,
  designed, presenter-ready artifact.
</TalkTrack>

---

<StatementSlide
  axis="centered"
  kicker="the thesis"
  subtitle="a good cat meme is not a picture. it is a social API: one frame, one feeling, everyone already knows the payload."
  title="cats are the internet's lowest-latency emotional protocol"
/>

<TalkTrack>
  Set the language. A meme works because the image carries shared state. That is
  also why MDX is fun here: every slide can switch format as fast as the joke
  switches format.
</TalkTrack>

---

<HeroBento label="why this deck exists" title="MDX turns meme logic into deck logic">
  <HeroBento.Hero
    src="/slide-media/memes/cat-spin.gif"
    alt="Maxwell the spinning cat"
  />
  <HeroBento.Card
    title="Content"
    body="The source is plain MDX: frontmatter, JSX slide templates, and talk-track notes in one file."
  />
  <HeroBento.Card
    title="Pacing"
    body="A meme can become a cover, a taxonomy, a stat row, a full-bleed moment, or a gallery without rebuilding the app."
  />
  <HeroBento.Card
    title="Taste"
    body="The joke stays chaotic; the presentation system stays controlled."
  />
</HeroBento>

<TalkTrack>
  This is the product demo slide. The spinning cat is chaos, the bento is
  structure. That contrast sells the build better than a technical diagram.
</TalkTrack>

---

<SectionSlide
  axis="centered"
  number="01"
  subtitle="first, the grammar: reaction face, sound-loop cat, banana-suit tragedy, comparison flex, ancient lore, and cursed corporate roleplay."
  title="The meme format stack"
/>

<TalkTrack>
  Introduce the categories. The point is to show more than famous examples:
  each meme is a format, and formats can be remixed.
</TalkTrack>

---

<StatBento label="format taxonomy" title="six formats, one shared timeline">
  <StatBento.Body>
    Cat memes travel because they are tiny templates. The same animal can be a
    reaction, a ranking system, a sound loop, a political cartoon, a desktop
    mascot, or a legally questionable brand asset.
  </StatBento.Body>
  <StatBento.Stat value="reaction" label="Smudge, Huh Cat, Side Eye Cat" />
  <StatBento.Stat value="cry type" label="Crying Cat, Banana Cat, sad edits" />
  <StatBento.Stat value="sound loop" label="Happy Cat, Chipi Chipi, CatJAM" />
  <StatBento.Stat value="versus" label="GigaChad Cat, average enjoyer" />
  <StatBento.Stat value="lore" label="Nyan Cat, Longcat, Ceiling Cat" />
  <StatBento.Stat value="meta" label="AI cats, brand cats, bait formats" />
</StatBento>

<TalkTrack>
  Use this like a table of contents. It gives the audience handles before the
  deck starts moving faster.
</TalkTrack>

---

<Section>The roster · image macro</Section>

<SplitWithStat label="exhibit 01" title="Buff Cat: the sincere flex">
  <SplitWithStat.Text
    body="A cat that looks like it does pull day. Use it when a thing is unreasonably powerful: a one-line fix, a perfect roast, a teammate who ships before lunch."
    bullets={[
      "caption voice: short, lowercase, no explanation",
      "best paired with: built different / absolute unit / no notes",
    ]}
    title="built different"
  />
  <SplitWithStat.Media
    src="/slide-media/memes/cat-beats-cat-aggr-meme.gif"
    alt="Buff cat meme"
  />
  <SplitWithStat.Stat value="flex" label="core emotion" />
  <SplitWithStat.Stat value="2s" label="time to understand" />
  <SplitWithStat.Stat value="low" label="caption needed" />
  <SplitWithStat.Stat value="high" label="reaction value" />
</SplitWithStat>

<TalkTrack>
  This is the cleanest meme-as-interface example. The body explains the format,
  the stat strip makes the slide system feel productized.
</TalkTrack>

---

<MediaTrio label="exhibit 02" title="Corporate cats: CEO of literally anything">
  <MediaTrio.Hero
    src="/slide-media/memes/shocked-shocked-cat.gif"
    alt="Business cat wearing a tie"
  />
  <MediaTrio.Media
    src="/slide-media/memes/cat-beats-cat-aggr-meme.gif"
    alt="Buff cat as a power-user archetype"
  />
  <MediaTrio.Media
    src="/slide-media/memes/cat-67.gif"
    alt="Chad cat comparison format"
  />
</MediaTrio>

<TalkTrack>
  Business Cat is the easiest prompt format in the deck: CEO of merge conflicts,
  CEO of ignoring Slack, CEO of pushing to main. The MediaTrio layout shows
  variant thinking instead of one isolated example.
</TalkTrack>

---

<Grid cols={12} rows={8} label="caption engine" title="make it feed-native, not brand-safe">
  <Cell colStart={1} colSpan={4} rowStart={1} rowSpan={4} padding="md" variant="muted">
    <Stack gap="sm" justify="center">
      <Label font="sans">too brand</Label>
      <Body size="sm">Our feline friend demonstrates impressive workplace leadership.</Body>
      <Badge>do not post</Badge>
    </Stack>
  </Cell>
  <Cell colStart={5} colSpan={4} rowStart={1} rowSpan={4} padding="md" variant="outline">
    <Stack gap="sm" justify="center">
      <Label font="sans">getting warmer</Label>
      <Body size="sm">when the intern fixes prod with one CSS line</Body>
      <Badge>usable</Badge>
    </Stack>
  </Cell>
  <Cell colStart={9} colSpan={4} rowStart={1} rowSpan={4} padding="md" variant="accent">
    <Stack gap="sm" justify="center">
      <Label font="sans">feed-native</Label>
      <Body size="sm">bro is the CEO of z-index</Body>
      <Badge>ship it</Badge>
    </Stack>
  </Cell>
  <Cell colStart={1} colSpan={12} rowStart={6} rowSpan={3} padding="md" variant="rule">
    <Trio gap="lg" ratio="1/1/1">
      <Stack gap="xs">
        <Display size="sm">01</Display>
        <Body size="sm">short enough to screenshot</Body>
      </Stack>
      <Stack gap="xs">
        <Display size="sm">02</Display>
        <Body size="sm">sounds like a person, not a campaign</Body>
      </Stack>
      <Stack gap="xs">
        <Display size="sm">03</Display>
        <Body size="sm">leaves room for the image to do the bit</Body>
      </Stack>
    </Trio>
  </Cell>
</Grid>

<TalkTrack>
  This slide makes the feed-fluency requirement explicit: native internet
  voice is compression, timing, and social confidence.
</TalkTrack>

---

<Section>The roster · reaction faces</Section>

<TextLead label="format cards" title="the reaction cats you can feel without context">
  <TextLead.Text
    body="Some cats are not punchlines; they are reusable facial expressions. The format is the face plus the situation you project onto it."
    bullets={[
      "Smudge / Woman Yelling at Cat: conflict, accusation, dinner-table drama",
      "Huh Cat: wide-eyed buffering, pure 'wait what' energy",
      "Side Eye Cat: silent judgment, no reply necessary",
    ]}
    title="reaction images are emotional shortcuts"
  />
  <TextLead.Media
    src="/slide-media/memes/cat-huh.gif"
    alt="Huh Cat reaction GIF"
  />
  <TextLead.Media
    src="/slide-media/memes/cat-side-eye.gif"
    alt="Side Eye Cat reaction GIF"
  />
  <TextLead.Media
    src="/slide-media/memes/banana-cat.gif"
    alt="Sad Banana Cat meme image"
  />
</TextLead>

<TalkTrack>
  This slide pulls in more canonical memes without requiring unlicensed images.
  It also explains format, not just trivia.
</TalkTrack>

---

<QuoteWithMedia label="exhibit 03" title="Smudge: the courtroom drama cat">
  <QuoteWithMedia.Quote
    attribution="every comment section, eventually"
    text="me explaining why the tiny bug is actually a product decision"
  />
  <QuoteWithMedia.Media
    src="/slide-media/memes/cat-huh.gif"
    alt="Huh Cat reaction GIF"
  />
</QuoteWithMedia>

<TalkTrack>
  Smudge / Woman Yelling at Cat is a two-panel argument machine. I am not using
  the actual image here; the slide is about the grammar: accusation on one side,
  impossible cat response on the other.
</TalkTrack>

---

<Section>The roster · motion loops</Section>

<FullBleedSlide
  label="exhibit 04"
  mediaAlt="Maxwell the spinning cat loop"
  mediaSrc="/slide-media/memes/cat-spin.gif"
  title="Maxwell: a GIF with no reason and therefore infinite reason"
/>

<TalkTrack>
  This is the screenshot moment. Let the motion run. The slide proves the player
  handles animated media as a first-class slide surface.
</TalkTrack>

---

<ImageDuoSlide
  caption="reaction split: buffering vs suspiciously aware"
  left={{ src: "/slide-media/memes/cat-huh.gif", alt: "Huh Cat reaction GIF" }}
  right={{ src: "/slide-media/memes/cat-side-eye.gif", alt: "Side Eye Cat reaction GIF" }}
/>

<TalkTrack>
  Use this as a pure visual beat after the full bleed. Two GIFs, no prose. This
  is the point where the deck feels like it belongs on the internet.
</TalkTrack>

---

<Grid cols={12} rows={8} label="motion loop syntax" title="the cat is the album art for the sound">
  <Cell colStart={1} colSpan={5} rowStart={1} rowSpan={5} padding="none">
    <Stack gap="lg" justify="center">
      <Subtitle color="default">sound-first memes</Subtitle>
      <Body>
        The newer wave is basically soundboard culture wearing cat ears. The
        image sets the face, but the loop does the posting. You are not watching
        the cat; you are remembering the audio.
      </Body>
      <List marker="dash">
        <Item>Happy Cat: joy as a loading animation</Item>
        <Item>Chipi Chipi: earworm first, cat second</Item>
        <Item>CatJAM: approval, but with BPM</Item>
      </List>
    </Stack>
  </Cell>
  <Cell colStart={6} colSpan={4} rowStart={1} rowSpan={4} overflow="hidden" padding="none">
    <img
      alt="Happy Cat loop"
      className="size-full object-cover"
      height={720}
      src="/slide-media/memes/happy-cat.gif"
      width={960}
    />
  </Cell>
  <Cell colStart={10} colSpan={3} rowStart={1} rowSpan={4} overflow="hidden" padding="none">
    <img
      alt="Dancing cat loop"
      className="size-full object-cover"
      height={720}
      src="/slide-media/memes/dancing-cat-cat.gif"
      width={720}
    />
  </Cell>
  <Cell colStart={6} colSpan={3} rowStart={5} rowSpan={4} overflow="hidden" padding="none">
    <img
      alt="Banana Cat loop"
      className="size-full object-cover"
      height={720}
      src="/slide-media/memes/banana-cat.gif"
      width={720}
    />
  </Cell>
  <Cell colStart={9} colSpan={4} rowStart={5} rowSpan={4} padding="md" variant="accent">
    <Stack className="min-h-0 flex-1" gap="sm" justify="center">
      <Display size="sm">03s</Display>
      <Label font="sans">enough time to become a personality</Label>
      <Body color="muted" size="sm">
        In MDX, this is not a special case. It is just another layout: text,
        media, rhythm, repeat.
      </Body>
    </Stack>
  </Cell>
</Grid>

<TalkTrack>
  This should feel more like a rhythm board than an explainer. The point is
  that MDX can hold moving media, editorial copy, and a punchline stat in one
  composed slide.
</TalkTrack>

---

<Section>The roster · comparison memes</Section>

<SplitHalf axis="vertical" label="exhibit 05" title="GigaChad Cat: average enjoyer grammar">
  <SplitHalf.Panel>
    <Stack gap="lg" justify="center">
      <Subtitle color="default">comparison, but make it absurdly confident</Subtitle>
      <Body>
        The format is simple: put the fragile take on one side, put the
        overconfident cat take on the other, and let the jawline do the
        persuasion.
      </Body>
      <List marker="dash">
        <Item>average slide deck fan vs average MDX deck enjoyer</Item>
        <Item>average "can we make it pop" vs average token system enjoyer</Item>
      </List>
    </Stack>
  </SplitHalf.Panel>
  <SplitHalf.Panel>
    <div className="flex min-h-0 flex-1 items-stretch overflow-hidden rounded-2xl">
      <img
        alt="GigaChad cat comparison format"
        className="size-full flex-1 object-cover"
        height={1080}
        src="/slide-media/memes/cat-67.gif"
        width={1920}
      />
    </div>
  </SplitHalf.Panel>
</SplitHalf>

<TalkTrack>
  This is the most self-aware slide: compare normal deck workflows with MDX as
  the chad path, but do it with a wink.
</TalkTrack>

---

<Collage label="reaction matrix" title="one cat, many jobs">
  <Collage.Featured
    src="/slide-media/memes/cat-67.gif"
    alt="Chad cat featured meme"
  />
  <Collage.Image
    src="/slide-media/memes/cat-beats-cat-aggr-meme.gif"
    alt="Buff cat meme"
  />
  <Collage.Image
    src="/slide-media/memes/shocked-shocked-cat.gif"
    alt="Business cat meme"
  />
  <Collage.Image
    src="/slide-media/memes/cat-huh.gif"
    alt="Huh Cat reaction GIF"
  />
  <Collage.Image
    src="/slide-media/memes/happy-cat.gif"
    alt="Sad Banana Cat reaction image"
  />
</Collage>

<TalkTrack>
  This is a visual system slide: the same asset pool can produce a catalog,
  matrix, gallery, and full-screen beat.
</TalkTrack>

---

<SectionSlide
  imageAlt="Cat meme media collage"
  imageSrc="/slide-media/memes/cat-spin.gif"
  number="02"
  subtitle="now zoom out: the deck is not ranking cats. it is ranking how well a format survives remix."
  title="Hall of fame criteria"
/>

<TalkTrack>
  Pivot from examples to criteria. This makes the deck feel authored and gives
  you a reason for the roster beyond vibes.
</TalkTrack>

---

<TimelineBento label="meme lifecycle" title="how a cat becomes canon">
  <TimelineBento.Intro
    body="The meme has to survive outside the original post. If it cannot be reused, it is only a funny image."
    title="From cat to format"
  />
  <TimelineBento.Step
    body="One image creates an instantly legible emotional state."
    step="01"
    title="recognize"
  />
  <TimelineBento.Step
    body="People attach their own situation without needing permission."
    step="02"
    title="remix"
  />
  <TimelineBento.Step
    body="The format becomes shorthand; the original context barely matters."
    step="03"
    title="canonize"
  />
</TimelineBento>

<TalkTrack>
  A clean framework slide. It also showcases TimelineBento as a serious
  template inside a silly topic.
</TalkTrack>

---

<Grid cols={12} rows={8} label="hall of fame board" title="different cats to pull into the canon">
  <Cell colStart={1} colSpan={3} rowStart={1} rowSpan={4} padding="md" variant="muted">
    <Stack gap="sm" justify="center">
      <Label font="sans">Huh Cat</Label>
      <Body size="sm">wide-eyed confusion, object-labeling bait, brain buffering on camera</Body>
    </Stack>
  </Cell>
  <Cell colStart={4} colSpan={3} rowStart={1} rowSpan={4} padding="md" variant="outline">
    <Stack gap="sm" justify="center">
      <Label font="sans">Sad Banana Cat</Label>
      <Body size="sm">tiny tragedy in a fruit costume, usually paired with emotional whiplash</Body>
    </Stack>
  </Cell>
  <Cell colStart={7} colSpan={3} rowStart={1} rowSpan={4} padding="md" variant="muted">
    <Stack gap="sm" justify="center">
      <Label font="sans">Happy Happy Cat</Label>
      <Body size="sm">unfiltered joy loop, TikTok remix fuel, instant serotonin delivery</Body>
    </Stack>
  </Cell>
  <Cell colStart={10} colSpan={3} rowStart={1} rowSpan={4} padding="md" variant="outline">
    <Stack gap="sm" justify="center">
      <Label font="sans">Chipi Chipi Cat</Label>
      <Body size="sm">sound-first meme logic: the cat is basically cover art for the earworm</Body>
    </Stack>
  </Cell>
  <Cell colStart={1} colSpan={3} rowStart={5} rowSpan={4} padding="md" variant="outline">
    <Stack gap="sm" justify="center">
      <Label font="sans">CatJAM</Label>
      <Body size="sm">Twitch-era vibing, tiny head bob as approval stamp</Body>
    </Stack>
  </Cell>
  <Cell colStart={4} colSpan={3} rowStart={5} rowSpan={4} padding="md" variant="muted">
    <Stack gap="sm" justify="center">
      <Label font="sans">Pop Cat</Label>
      <Body size="sm">soundless rhythm, interaction bait, perfect for counters and taps</Body>
    </Stack>
  </Cell>
  <Cell colStart={7} colSpan={3} rowStart={5} rowSpan={4} padding="md" variant="outline">
    <Stack gap="sm" justify="center">
      <Label font="sans">Beluga</Label>
      <Body size="sm">Discord-cat persona, chat-log storytelling, profile-picture character lore</Body>
    </Stack>
  </Cell>
  <Cell colStart={10} colSpan={3} rowStart={5} rowSpan={4} padding="md" variant="accent">
    <Stack gap="sm" justify="center">
      <Label font="sans">Nyan Cat</Label>
      <Body size="sm">still the boss fight: pixel cat, poptart body, rainbow trail, browser maximalism</Body>
    </Stack>
  </Cell>
</Grid>

<TalkTrack>
  This is the "pull more memes in" slide. It broadens the hall of fame without
  forcing unlicensed images into the repo.
</TalkTrack>

---

<Section>What the build proves</Section>

<TextLead label="MDX receipts" title="why this is a better demo than a normal slide deck">
  <TextLead.Text
    body="The topic is unserious on purpose. If the slide engine can make cat memes feel structured, paced, sourced, animated, and presentable, it can carry real portfolio stories too."
    bullets={[
      "frontmatter drives the OS63 deck picker",
      "MDX keeps prose, JSX templates, media, and talk tracks together",
      "templates give rhythm; primitives let weird internet-native layouts happen",
    ]}
    title="the medium is the flex"
  />
  <TextLead.Media
    src="/slide-media/memes/cat-laughing.gif"
    alt="Laughing Cat reaction GIF"
  />
</TextLead>

<TalkTrack>
  This slide reconnects the content back to your goal: showcase the MDX slide
  build. The cats are the demo data.
</TalkTrack>

---

<SplitHalf axis="horizontal" gap="lg" label="source of truth" title="one MDX file, many presentation surfaces">
  <SplitHalf.Panel>
    <Stack gap="md" justify="center">
      <Subtitle color="default">inside the deck file</Subtitle>
      <Body>
        Frontmatter defines title, date, and description. JSX chooses slide
        templates. Markdown-like prose becomes talk track. Media paths stay
        portable inside OS63.
      </Body>
    </Stack>
  </SplitHalf.Panel>
  <SplitHalf.Panel>
    <Columns align="stretch" count={3} gap="md">
      <Stack gap="xs" justify="center">
        <Display size="sm">01</Display>
        <Body size="sm">deck picker metadata</Body>
      </Stack>
      <Stack gap="xs" justify="center">
        <Display size="sm">02</Display>
        <Body size="sm">runtime slides player</Body>
      </Stack>
      <Stack gap="xs" justify="center">
        <Display size="sm">03</Display>
        <Body size="sm">read-only source view</Body>
      </Stack>
    </Columns>
  </SplitHalf.Panel>
</SplitHalf>

<TalkTrack>
  This is a technical slide disguised as an editorial slide. It names the OS63
  integration without breaking the vibe.
</TalkTrack>

---

<Section>Before you post</Section>

<Grid cols={12} rows={8} label="legal-but-make-it-meme" title="copy the format, not the file">
  <Cell colStart={1} colSpan={5} rowStart={1} rowSpan={8} padding="none">
    <Stack gap="lg" justify="center">
      <Subtitle color="default">famous memes have owners</Subtitle>
      <Body>
        This deck uses real meme references to explain the language. For
        anything public-facing, remake the energy with cleared media instead of
        shipping the original viral file.
      </Body>
      <List marker="dash">
        <Item>steal the grammar: pose, crop, caption rhythm, timing</Item>
        <Item>replace the file: your own cat, licensed stock, cleared CC media</Item>
        <Item>keep the joke short enough that the image still does the work</Item>
      </List>
    </Stack>
  </Cell>
  <Cell colStart={7} colSpan={3} rowStart={1} rowSpan={4} padding="md" variant="accent">
    <Stack className="min-h-0 flex-1" gap="sm" justify="start">
      <Display size="sm">$710k</Display>
      <Label font="sans">Grumpy Cat cautionary tale</Label>
      <Body color="muted" size="sm">
        meme fluency does not cancel copyright.
      </Body>
    </Stack>
  </Cell>
  <Cell colStart={10} colSpan={3} rowStart={1} rowSpan={4} padding="md" variant="muted">
    <Stack className="min-h-0 flex-1" gap="sm" justify="start">
      <Display size="sm">01</Display>
      <Label font="sans">format</Label>
      <Body size="sm">what people recognize instantly</Body>
    </Stack>
  </Cell>
  <Cell colStart={7} colSpan={3} rowStart={5} rowSpan={4} padding="md" variant="outline">
    <Stack className="min-h-0 flex-1" gap="sm" justify="start">
      <Display size="sm">02</Display>
      <Label font="sans">asset</Label>
      <Body size="sm">the file you need permission to use</Body>
    </Stack>
  </Cell>
  <Cell colStart={10} colSpan={3} rowStart={5} rowSpan={4} padding="md" variant="muted">
    <Stack className="min-h-0 flex-1" gap="sm" justify="start">
      <Display size="sm">03</Display>
      <Label font="sans">remake</Label>
      <Body size="sm">the version that can actually ship</Body>
    </Stack>
  </Cell>
</Grid>

<TalkTrack>
  Make the legal beat feel designed instead of apologetic. The distinction is
  simple: copy the grammar, clear the asset, remake the meme.
</TalkTrack>

---

<FullBleedGallery label="final feed" title="the timeline is the gallery">
  <FullBleedGallery.Image
    src="/slide-media/memes/cat-beats-cat-aggr-meme.gif"
    alt="Cat-beats-cat aggression meme"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/shocked-shocked-cat.gif"
    alt="Shocked cat reaction meme"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/cat-67.gif"
    alt="Cat 67 meme"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/cat-spin.gif"
    alt="Spinning cat meme"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/dancing-cat-cat.gif"
    alt="Dancing cat meme"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/scuba-scuba-cat-1.gif"
    alt="Scuba cat meme"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/cat-huh.gif"
    alt="Huh Cat reaction GIF"
  />
  <FullBleedGallery.Image
    src="/slide-media/memes/cat-side-eye.gif"
    alt="Side Eye Cat reaction GIF"
  />
</FullBleedGallery>

<TalkTrack>
  Final visual recap before the quote. The gallery ignores padding, like the
  internet ignoring your carefully constructed grid.
</TalkTrack>

---

<QuoteSlide
  attribution="the feed, probably"
  quote="you do not own the cat. the cat owns the timeline."
/>

<TalkTrack>
  Land the thesis again as a meme proverb. Short pause, then close.
</TalkTrack>

---

<ClosingSlide
  eyebrow="ship one"
  handles={[
    { label: "Format", value: "copy the grammar" },
    { label: "Media", value: "use your own cat" },
    { label: "Built with", value: "MDX · OS63 · @atom63/slides" },
  ]}
  title="long may they reign"
  website="atom63.com"
/>

<TalkTrack>
  End with the actual call to action: the deck is funny, but the artifact is a
  real build demo.
</TalkTrack>
`;export{e as default};