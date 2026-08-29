var e=`---
title: "Slide Templates"
date: "2026-04-16"
description: "Reference deck for Meridian slide layouts — editorial flow, bentos, full-bleed, quotes, primitives."
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
  ImageSlide,
  ImageDuoSlide,
  ImageTrioSlide,
  ClosingSlide,
} from "@atom63/slides";
import { TalkTrack, Section } from "@atom63/slides";
import {
  Grid,
  Cell,
  Title,
  Subtitle,
  Body,
  Display,
  Label,
  Stack,
  Spacer,
  Columns,
  Split,
  Trio,
  List,
  Item,
  Reveal,
} from "@atom63/slides";

<CoverSlide
  credit="Meridian · Meridian"
  eyebrow="2026"
  title="A grammar for decks"
/>

<TalkTrack>
  Opening beat: this deck is both a catalog and a story. Use it to audition
  layouts before you commit copy in a real narrative deck.
</TalkTrack>

---

<SectionSlide
  number="01"
  subtitle="Templates are opinionated layouts. Primitives are the escape hatch. Together they keep slides feeling authored—not like a theme park."
  title="Why this exists"
/>

---

<Section>Modern rhythm</Section>

<StatementSlide
  kicker="Keynote pattern"
  subtitle="Use for a single beat with no supporting chrome—agenda pivots, principles, or the one line the room should remember. Headlines use balance; body uses pretty rag."
  title="Center the thesis, then leave"
/>

---

<SplitHalf
  axis="vertical"
  label="SplitHalf"
  title="Vertical 50/50 — language beside evidence"
>
  <SplitHalf.Panel>
    <Stack gap="lg">
      <Subtitle color="default">Narrative column</Subtitle>
      <Body>
        Contemporary decks pair narrative in one column with photography or
        product in the other. A wide gutter between halves keeps the slide from
        feeling like two cramped cards.
      </Body>
      <List marker="dash">
        <Item>Default gap is generous (xl) so groups read as distinct.</Item>
        <Item>
          Let imagery run full height of the content area when possible.
        </Item>
      </List>
    </Stack>
  </SplitHalf.Panel>
  <SplitHalf.Panel>
    <div className="flex min-h-0 flex-1 items-stretch">
      <img
        alt="Meridian OS desktop environment"
        className="size-full flex-1 object-cover"
        height={1080}
        src="/slide-media/sys63-04.svg"
        width={1920}
      />
    </div>
  </SplitHalf.Panel>
</SplitHalf>

---

<SplitHalf
  axis="horizontal"
  gap="lg"
  label="SplitHalf"
  title="Horizontal 50/50 — headline band, detail deck"
>
  <SplitHalf.Panel>
    <Stack className="max-w-[880px]" gap="md" justify="center">
      <Subtitle color="default">Upper band</Subtitle>
      <Body>
        Keep the top half flush-left so the slide inherits the same editorial
        rhythm as the rest of the deck—short headline, tight subcopy, plenty of
        air on the right.
      </Body>
    </Stack>
  </SplitHalf.Panel>
  <SplitHalf.Panel>
    <Columns align="stretch" count={2} gap="md">
      <div className="flex min-h-0 flex-col justify-start border-foreground/25 border-t p-6 pt-5">
        <Label font="sans">North star</Label>
        <Spacer size="sm" />
        <Body size="sm">One decision or metric that anchors the story.</Body>
      </div>
      <div className="flex min-h-0 flex-col justify-start border-foreground/25 border-t p-6 pt-5">
        <Label font="sans">Constraint</Label>
        <Spacer size="sm" />
        <Body size="sm">The tradeoff that keeps the narrative honest.</Body>
      </div>
    </Columns>
  </SplitHalf.Panel>
</SplitHalf>

---

<Section>Asymmetric splits</Section>

<Stack gap="xl">
  <Stack gap="xs">
    <Label font="sans">Split · ratio="2/1"</Label>
    <Title>Narrative leads, aside supports</Title>
  </Stack>
  <Split gap="lg" ratio="2/1">
    <Stack gap="md" justify="center">
      <Subtitle color="default">Main column · 8/12</Subtitle>
      <Body>
        Reach for Split when you need an asymmetric pair—long-form prose beside
        a pull stat, a thesis beside a crop, or a product note beside a brand
        mark. Authors never touch colStart; the primitive does the math.
      </Body>
      <List marker="dash">
        <Item>Available ratios: 1/1, 2/1, 1/2, 3/1, 1/3.</Item>
        <Item>
          Spans resolve on the shared 12-col rhythm, so splits align with bentos
          slide-to-slide.
        </Item>
      </List>
    </Stack>
    <Stack gap="sm" justify="center">
      <Label font="sans">Aside · 4/12</Label>
      <Display color="accent" size="sm">
        01
      </Display>
      <Body color="muted" size="sm">
        Use for the one number or quote that anchors the read.
      </Body>
    </Stack>
  </Split>
</Stack>

---

<Stack gap="xl">
  <Stack gap="xs">
    <Label font="sans">Split · ratio="1/3"</Label>
    <Title>Tight margin, wide canvas</Title>
  </Stack>
  <Split gap="lg" ratio="1/3">
    <Stack gap="sm" justify="center">
      <Label font="sans">Margin · 3/12</Label>
      <Subtitle color="default">Context</Subtitle>
      <Body size="sm">
        Keep this narrow: a section label, a timestamp, or a single line of
        copy.
      </Body>
    </Stack>
    <div className="flex min-h-0 flex-1 items-stretch overflow-hidden rounded-2xl">
      <img
        alt="Nexa brand still"
        className="size-full object-cover"
        height={1080}
        src="/slide-media/nexa-01.svg"
        width={1920}
      />
    </div>
  </Split>
</Stack>

---

<Stack gap="xl">
  <Stack gap="xs">
    <Label font="sans">Trio · ratio="2/1/1"</Label>
    <Title>Lead beat, then two echoes</Title>
  </Stack>
  <Trio gap="lg" ratio="2/1/1">
    <Stack gap="sm" justify="center">
      <Subtitle color="default">Lead · 6/12</Subtitle>
      <Body size="sm">
        The wide column carries the headline thought. Use it for the part of the
        argument that needs room to breathe.
      </Body>
    </Stack>
    <Stack gap="sm" justify="center">
      <Label font="sans">Echo · 3/12</Label>
      <Body size="sm">A clarification, a caveat, or a companion stat.</Body>
    </Stack>
    <Stack gap="sm" justify="center">
      <Label font="sans">Echo · 3/12</Label>
      <Body size="sm">A second supporting beat in parallel rhythm.</Body>
    </Stack>
  </Trio>
</Stack>

---

<Section>Bento</Section>

<HeroBento
  label="HeroBento"
  title="Lead with one image, support with three beats"
>
  <HeroBento.Hero
    src="/slide-media/holo-01.svg"
    alt="Holovita product hero"
  />
  <HeroBento.Card
    body="The hero owns the emotional read; it should feel inevitable, not decorative."
    title="Anchor"
  />
  <HeroBento.Card
    body="Short clauses only—this column is for rhythm, not paragraphs."
    title="Contrast"
  />
  <HeroBento.Card
    body="Three cards max keeps the grid legible at a glance."
    title="Restraint"
  />
</HeroBento>

---

<MediaTrio label="MediaTrio" title="One statement, two receipts">
  <MediaTrio.Hero
    src="/slide-media/holo-02.svg"
    alt="Brand mark on gradient"
  />
  <MediaTrio.Media
    src="/slide-media/holo-03.svg"
    alt="App icon study"
  />
  <MediaTrio.Media
    src="/slide-media/holo-04.svg"
    alt="UI widget detail"
  />
</MediaTrio>

---

<Section>Density</Section>

<StatBento label="StatBento" title="Room for a thesis, then the numbers">
  <StatBento.Body>
    When you need one breath of language before metrics, put it here. Drop the
    body entirely and the stats rise—better for pace, worse for context. Choose
    based on the room, not habit.
  </StatBento.Body>
  <StatBento.Stat value="1920×1080" label="Canvas" />
  <StatBento.Stat value="16:9" label="Aspect" />
  <StatBento.Stat value="MDX" label="Source" />
  <StatBento.Stat value="Dark" label="Theme" />
  <StatBento.Stat value="PiP" label="Presenter" />
  <StatBento.Stat value="∞" label="Variants" />
</StatBento>

---

<StatBento
  label="StatBento · tight"
  title="When the story is already in the room"
>
  <StatBento.Stat value="800+" label="Tokens" />
  <StatBento.Stat value="18" label="Slides" />
  <StatBento.Stat value="1" label="Author" />
  <StatBento.Stat value="Ship" label="Outcome" />
</StatBento>

---

<Collage label="Collage" title="Featured still, supporting studies">
  <Collage.Featured
    src="/slide-media/holo-15.svg"
    alt="Holovita marketing still"
  />
  <Collage.Image
    src="/slide-media/holo-11.svg"
    alt="Interface composition"
  />
  <Collage.Image
    src="/slide-media/holo-13.svg"
    alt="Palette exploration"
  />
  <Collage.Image src="/slide-media/holo-14.svg" alt="Icon grid" />
  <Collage.Image
    src="/slide-media/nexa-04.svg"
    alt="Hyperlink mark exploration"
  />
</Collage>

---

<QuoteSlide
  attribution="On restraint"
  quote="The grid is not a cage. It is the reason the exception reads as an exception."
/>

---

<SectionSlide
  imageAlt="Nexa brand still life"
  imageSrc="/slide-media/nexa-01.svg"
  number="02"
  subtitle="Use a section slide when the narrative pivots—new chapter, new problem, new voice. Image optional; silence is allowed."
  title="Chapters without apology"
/>

---

<Section>Voice + proof</Section>

<QuoteWithMedia label="QuoteWithMedia" title="Pull quote, full-height witness">
  <QuoteWithMedia.Quote
    attribution="Handoff"
    text="If the prototype cannot wear the same tokens as the deck, both are lying."
  />
  <QuoteWithMedia.Media
    src="/slide-media/nexa-08.svg"
    alt="Hyperlink brand mark variant"
  />
</QuoteWithMedia>

---

<SplitWithStat
  label="SplitWithStat"
  title="Argument on the left, evidence on the right, proof strip below"
>
  <SplitWithStat.Text
    body="The text cell holds the claim. Media is cropped, not coddled. The bottom row is for numbers that survive cross-examination."
    bullets={[
      "Cover crops to the cell—no letterboxing theater",
      "Up to four stats; empty slots are fine",
    ]}
    title="Make the case"
  />
  <SplitWithStat.Media
    src="/slide-media/sys63-02.svg"
    alt="Meridian OS window chrome"
  />
  <SplitWithStat.Stat value="60" label="FPS target" />
  <SplitWithStat.Stat value="WCAG" label="Contrast" />
  <SplitWithStat.Stat value="CSS" label="Tokens" />
  <SplitWithStat.Stat value="1:1" label="Figma ↔ code" />
</SplitWithStat>

---

<TextLead label="TextLead" title="Long lead, then three equal witnesses">
  <TextLead.Text
    body="Stack context first: the decision, the constraint, the tradeoff. Then let three crops argue in parallel—variants, states, or before/after without a carousel."
    title="Explain, then show"
  />
  <TextLead.Media
    src="/slide-media/sys63-01.svg"
    alt="Meridian OS cover artwork"
  />
  <TextLead.Media
    src="/slide-media/sys63-03.svg"
    alt="Meridian OS secondary still"
  />
  <TextLead.Media
    alt="Placeholder — replace with final image"
    src="/slide-media/placeholder.svg"
  />
</TextLead>

---

<TextLead label="TextLead · split" title="One image, side by side with copy">
  <TextLead.Text
    body="A single TextLead.Media triggers a 7/12 · 5/12 split—good for a portrait, a device frame, or one hero crop you do not want to shrink."
    title="Portrait or proof"
  />
  <TextLead.Media
    src="/slide-media/sys63-02.svg"
    alt="Meridian OS window chrome detail"
  />
</TextLead>

---

<TextLead label="TextLead · type" title="When imagery would dilute the claim">
  <TextLead.Text
    body="Omit media and the template collapses to a single column. Use it for principles, non-negotiables, or the one sentence you need the room to hear."
    title="Let the words carry"
  />
</TextLead>

---

<TimelineBento label="TimelineBento" title="Intro lane, then three beats">
  <TimelineBento.Intro
    body="Steps read left-to-right like a sentence. Keep titles verbs or nouns—not sentences."
    title="Phases, not slides"
  />
  <TimelineBento.Step
    body="Interviews, heuristics, baseline metrics—know the floor."
    step="01"
    title="Discover"
  />
  <TimelineBento.Step
    body="Grids, tokens, contracts—know the rules."
    step="02"
    title="Define"
  />
  <TimelineBento.Step
    body="MDX, motion, handoff—know the ship."
    step="03"
    title="Deliver"
  />
</TimelineBento>

---

<Section>Full bleed</Section>

<FullBleedSlide
  label="FullBleedSlide"
  mediaAlt="Meridian OS desktop environment"
  mediaSrc="/slide-media/sys63-04.svg"
  title="Still or motion to the edge; caption band optional"
/>

---

<FullBleedGallery
  label="FullBleedGallery"
  title="Mosaic that ignores slide padding—use sparingly"
>
  <FullBleedGallery.Image
    src="/slide-media/holo-02.svg"
    alt="Holovita logotype"
  />
  <FullBleedGallery.Image
    src="/slide-media/holo-03.svg"
    alt="Holovita icon"
  />
  <FullBleedGallery.Image
    src="/slide-media/holo-04.svg"
    alt="Holovita widgets"
  />
  <FullBleedGallery.Image
    src="/slide-media/holo-05.svg"
    alt="Holovita tagline"
  />
</FullBleedGallery>

---

<ImageSlide
  alt="Meridian OS desktop environment"
  caption="ImageSlide — single image, edge to edge"
  src="/slide-media/sys63-04.svg"
/>

---

<ImageDuoSlide
  caption="ImageDuoSlide — two images side by side"
  left={{ src: "/slide-media/sys63-01.svg", alt: "Meridian OS cover artwork" }}
  right={{ src: "/slide-media/sys63-02.svg", alt: "Meridian OS window chrome" }}
/>

---

<ImageTrioSlide
  caption="ImageTrioSlide — three equal columns"
  images={[
    { src: "/slide-media/holo-02.svg", alt: "Holovita logotype" },
    { src: "/slide-media/holo-03.svg", alt: "Holovita icon" },
    { src: "/slide-media/holo-04.svg", alt: "Holovita widgets" },
  ]}
/>

---

<Section>Primitives</Section>

<Grid
  cols={12}
  rows={8}
  label="Grid + Cell · 12 × 8 master"
  title="When no template fits, compose on the master grid"
>
  <Cell
    colStart={1}
    colSpan={8}
    padding="lg"
    rowStart={1}
    rowSpan={5}
    variant="muted"
  >
    <Stack gap="md">
      <Subtitle color="default">Custom bento</Subtitle>
      <Body>
        Reach for Grid + Cell only when Split or Trio don't fit. Defaults stay
        at 12 × 8 so custom slides inherit the same vertical lines as every
        template in the deck.
      </Body>
    </Stack>
  </Cell>
  <Cell
    colStart={9}
    colSpan={4}
    padding="md"
    rowStart={1}
    rowSpan={5}
    variant="accent"
  >
    <Stack className="min-h-0 flex-1" gap="sm" justify="center">
      <Display size="sm">12×8</Display>
      <Label font="sans">Master grid</Label>
    </Stack>
  </Cell>
  <Cell
    colStart={1}
    colSpan={4}
    padding="md"
    rowStart={6}
    rowSpan={3}
    variant="muted"
  >
    <Stack className="min-h-0 flex-1" gap="xs" justify="end">
      <Label font="sans">Span</Label>
      <Body size="sm">4 cols</Body>
    </Stack>
  </Cell>
  <Cell
    colStart={5}
    colSpan={4}
    padding="md"
    rowStart={6}
    rowSpan={3}
    variant="muted"
  >
    <Stack className="min-h-0 flex-1" gap="xs" justify="end">
      <Label font="sans">Span</Label>
      <Body size="sm">4 cols</Body>
    </Stack>
  </Cell>
  <Cell
    colStart={9}
    colSpan={4}
    padding="md"
    rowStart={6}
    rowSpan={3}
    variant="outline"
  >
    <Stack className="min-h-0 flex-1" gap="xs" justify="end">
      <Label font="sans">Span</Label>
      <Body size="sm">4 cols · outline</Body>
    </Stack>
  </Cell>
</Grid>

---

<Grid label="Reveal animations" number="∞">
  <Stack gap="md">
    <Label reveal index={0}>Stagger demo</Label>
    <Body reveal index={1}>This line enters first</Body>
    <Body reveal index={2} color="muted" size="sm">This line enters second</Body>
    <List marker="dash">
      <Item reveal index={3}>Third to arrive</Item>
      <Item reveal index={4}>Fourth to arrive</Item>
    </List>
    <Reveal index={5}>
      <Body color="muted" size="sm">Sixth — via the Reveal wrapper</Body>
    </Reveal>
  </Stack>
</Grid>

---

<ClosingSlide
  email="hello@atom63.com"
  eyebrow="Q&A"
  handles={[{ label: "Built with", value: "MDX · templates · primitives" }]}
  title="Now break it"
  website="atom63.com"
/>

<TalkTrack>
  Closing: invite questions, then send people back to their own deck with a
  clear next action—pick one template and ship a five-slide story.
</TalkTrack>
`;export{e as default};