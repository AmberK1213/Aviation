import { useMemo, useState } from 'react';
import {
  Card, Text, Title, Group, Stack, Badge, Progress,
  ThemeIcon, SimpleGrid, Paper, Box, Divider, Tabs,
} from '@mantine/core';
import { DonutChart, BarChart } from '@mantine/charts';
import { FilterState, NestingSite } from '../App';
import { Detection } from '../services/apiService';
import {
  Bird, MapPin, TrendingUp, Shield, Waves,
  Wind, AlertTriangle, CheckCircle, Leaf, Target,
  Search, Zap, TreePine, Globe, Ruler, CloudLightning, Wrench,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  filters: FilterState;
  onSiteSelect: (site: NestingSite) => void;
  sites: NestingSite[];
  surveyAnalysis: any;
  detections?: Detection[];
}

// Eco colour palette
const ECO = [
  '#2D6A4F', '#52B788', '#74C69D', '#40916C',
  '#1B4332', '#4A90D9', '#7EC8E3', '#95D5B2',
];

const RISK_CFG: Record<string, { color: string; border: string; bg: string; badge: string }> = {
  high:   { color: 'red',    border: '#EF4444', bg: '#FEF2F2', badge: 'red'    },
  medium: { color: 'orange', border: '#F59E0B', bg: '#FFFBEB', badge: 'orange' },
  low:    { color: 'teal',   border: '#2D6A4F', bg: '#F0FDF9', badge: 'teal'   },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function deriveHeadline(surveys: any[], topSpecies: string, total: number): string {
  if (!surveys.length || !topSpecies || topSpecies === '—') {
    return 'Upload an aerial survey to begin coastal habitat analysis.';
  }
  const cond = surveys[0]?.habitat_assessment?.condition ?? 'stable';
  const condWord: Record<string, string> = {
    healthy: 'Stable', stressed: 'Stressed', recovering: 'Recovering', degraded: 'Degraded',
  };
  const adj = condWord[cond] ?? 'Active';
  const sp  = topSpecies.split(' ').slice(0, 2).join(' ');
  const n   = surveys.length;
  return `${adj} bird populations with high ${sp} dominance across ${n} monitoring site${n !== 1 ? 's' : ''}.`;
}

function deriveRecommendation(surveys: any[], topSpecies: string) {
  if (!surveys.length) return null;

  const highRisk    = surveys.filter(s => s.overall_risk_level === 'high');
  const medRisk     = surveys.filter(s => s.overall_risk_level === 'medium');
  const highErosion = surveys.filter(s => s.habitat_assessment?.coastal_erosion_risk === 'high');
  const disturbed   = surveys.filter(s => s.climate_impact?.recent_disturbance);
  const sp = topSpecies.split(' ').slice(0, 2).join(' ') || 'dominant species';

  // Pull real-world coastal context from the highest-priority site's gemini_notes
  const prioritySurvey = highRisk[0] ?? highErosion[0] ?? medRisk[0] ?? surveys[0];
  const geminiCtx: string = prioritySurvey?.gemini_notes ?? '';
  // Trim to a single concise sentence for inline use
  const ctxSentence = geminiCtx ? geminiCtx.split(/\.\s+/)[0].replace(/\.$/, '') + '.' : '';

  if (highRisk.length > 0 || highErosion.length > 0) {
    const site = formatSiteName(highRisk[0]?.site_name ?? highErosion[0]?.site_name ?? 'affected sites');
    return {
      priority: 'high' as const,
      action: `Initiate emergency habitat stabilisation at ${site}. Coordinate with LDWF for immediate conservation intervention and restrict human access during active nesting season.`,
      rationale: `${highRisk.length} site(s) flagged high-risk with coastal erosion elevated at ${highErosion.length} location(s)${disturbed.length ? `, and recent climate disturbance recorded` : ''}.${ctxSentence ? ` Field context: ${ctxSentence}` : ''}`,
      connection: `High erosion risk directly threatens ${sp} nesting substrate — early intervention prevents colony displacement before breeding season peaks.`,
    };
  }

  if (medRisk.length > 0 || disturbed.length > 0) {
    return {
      priority: 'medium' as const,
      action: `Schedule follow-up aerial survey within 30 days. Monitor ${sp} nesting activity at medium-risk sites and document habitat change indicators.`,
      rationale: `${medRisk.length} site(s) require continued monitoring. Population appears stable but habitat stress indicators are present.${ctxSentence ? ` Site context: ${ctxSentence}` : ''}`,
      connection: `${sp} colonies show sensitivity to vegetation loss — habitat continuity at current sites is essential for breeding success.`,
    };
  }

  return {
    priority: 'low' as const,
    action: `Maintain current quarterly survey cadence. Document ${sp} colony boundaries and update baseline habitat records for long-term trend analysis.`,
    rationale: `All monitored sites show healthy habitat conditions. No immediate intervention required.${ctxSentence ? ` ${ctxSentence}` : ''}`,
    connection: `${sp} populations are thriving under current habitat conditions — preserving coastal marsh extent is the key conservation priority.`,
  };
}

function formatSiteName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

function deriveHabitatHealth(surveys: any[]): { label: string; color: string; mantineColor: string } | null {
  if (!surveys.length) return null;
  const conds = surveys.map(s => s.habitat_assessment?.condition ?? 'unknown');
  const healthy    = conds.filter(c => c === 'healthy').length;
  const recovering = conds.filter(c => c === 'recovering').length;
  const stressed   = conds.filter(c => c === 'stressed' || c === 'degraded').length;
  const ratio = healthy / conds.length;

  if (ratio >= 0.8)                          return { label: 'Excellent', color: '#2D6A4F', mantineColor: 'teal'   };
  if (ratio >= 0.5 || recovering > stressed) return { label: 'Good',      color: '#16A34A', mantineColor: 'green'  };
  if (stressed < healthy + recovering)       return { label: 'Fair',      color: '#D97706', mantineColor: 'yellow' };
  return                                            { label: 'At Risk',   color: '#DC2626', mantineColor: 'red'    };
}

// ── Reusable section heading ─────────────────────────────────────────────────
function Heading({ icon: Icon, color, title, sub }: {
  icon: any; color: string; title: string; sub?: string;
}) {
  return (
    <Group gap="sm" mb="lg">
      <ThemeIcon size={34} radius="xl" color={color} variant="light">
        <Icon size={18} />
      </ThemeIcon>
      <Box>
        <Text fw={600} size="sm" lh={1.2} c="dark.7">{title}</Text>
        {sub && <Text size="xs" c="dimmed" lh={1}>{sub}</Text>}
      </Box>
    </Group>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AnalyticsDashboard({
  filters, sites, surveyAnalysis, detections = [],
}: AnalyticsDashboardProps) {

  const filtered = useMemo(() => sites.filter(s => {
    if (filters.species.length && !filters.species.includes(s.species)) return false;
    if (filters.habitat.length && !filters.habitat.includes(s.habitat)) return false;
    if (filters.priority.length && !filters.priority.includes(s.priority)) return false;
    if (filters.verificationStatus.length && !filters.verificationStatus.includes(s.verificationStatus)) return false;
    if (s.abundance < filters.minAbundance) return false;
    return true;
  }), [sites, filters]);

  const stats = useMemo(() => {
    const total = filtered.reduce((s, x) => s + x.abundance, 0);
    const conf  = filtered.length
      ? filtered.reduce((s, x) => s + x.confidence, 0) / filtered.length
      : 0;

    const spMap: Record<string, number> = {};
    filtered.forEach(s => { spMap[s.species] = (spMap[s.species] || 0) + s.abundance; });
    const species = Object.entries(spMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const habMap: Record<string, number> = {};
    filtered.forEach(s => { habMap[s.habitat] = (habMap[s.habitat] || 0) + s.abundance; });
    const habitat = Object.entries(habMap)
      .map(([name, value]) => ({ name, Birds: value }))
      .sort((a, b) => b.Birds - a.Birds);

    return { total, conf, species, habitat, top: species[0]?.name ?? '—' };
  }, [filtered]);

  const surveys: any[]  = surveyAnalysis?.surveys ?? [];
  const [erosionPage, setErosionPage] = useState(0);
  const meta             = surveyAnalysis?.metadata;
  const API_BASE         = import.meta.env.VITE_API_URL || 'https://localhost:7001';

  const donutData = stats.species.map((s, i) => ({
    name: s.name, value: s.value, color: ECO[i % ECO.length],
  }));

  const avgHabitatBirds = stats.habitat.length
    ? Math.round(stats.habitat.reduce((s, h) => s + h.Birds, 0) / stats.habitat.length)
    : 0;

  const envStats = useMemo(() => {
    if (!surveys.length) return null;
    const cond: Record<string, number>    = {};
    const erosion: Record<string, number> = {};
    const dist: Record<string, number>    = {};
    surveys.forEach((s: any) => {
      const c = s.habitat_assessment?.condition ?? 'unknown';
      cond[c] = (cond[c] || 0) + 1;
      const e = s.habitat_assessment?.coastal_erosion_risk ?? 'unknown';
      erosion[e] = (erosion[e] || 0) + 1;
      const d = s.climate_impact?.disturbance_type;
      if (d && d !== 'none') dist[d] = (dist[d] || 0) + 1;
    });
    return { cond, erosion, dist, hasDisturbance: Object.keys(dist).length > 0 };
  }, [surveys]);

  const headline        = useMemo(() => deriveHeadline(surveys, stats.top, stats.total), [surveys, stats.top, stats.total]);
  const recommendation  = useMemo(() => deriveRecommendation(surveys, stats.top), [surveys, stats.top]);
  const habitatHealth   = useMemo(() => deriveHabitatHealth(surveys), [surveys]);

  const condColors: Record<string, string> = {
    healthy: '#2D6A4F', stressed: '#F59E0B', recovering: '#4A90D9', degraded: '#EF4444',
  };
  const erosionMantine: Record<string, string> = {
    low: 'teal', medium: 'yellow', high: 'red',
  };
  const recPriorityCfg = {
    high:   { border: '#EF4444', bg: '#FEF2F2', badge: 'red'    as const, label: 'HIGH PRIORITY'   },
    medium: { border: '#F59E0B', bg: '#FFFBEB', badge: 'orange' as const, label: 'MEDIUM PRIORITY' },
    low:    { border: '#2D6A4F', bg: '#F0FDF9', badge: 'teal'   as const, label: 'ROUTINE'         },
  };

  const cardStyle = {
    border: '1px solid rgba(45, 106, 79, 0.12)',
    boxShadow: '0 2px 12px rgba(45, 106, 79, 0.06)',
  };

  return (
    <Box
      p="xl"
      style={{
        background: 'linear-gradient(145deg, #F0F9F4 0%, #EBF5FB 55%, #F0F9F4 100%)',
        minHeight: '100vh',
      }}
    >
      <Stack gap="lg" maw={1320} mx="auto">

        {/* ── Headline ──────────────────────────────────────────────────── */}
        <Box>
          <Text
            size="xs" fw={700} tt="uppercase" mb={6}
            style={{ letterSpacing: '0.1em', color: '#52B788' }}
          >
            Coastal Habitat Analysis · Louisiana
          </Text>
          <Group align="flex-end" gap="md" wrap="nowrap">
            <Title order={2} fw={800} c="dark.8" lh={1.25} style={{ flex: 1 }}>
              {headline}
            </Title>
            {habitatHealth && (
              <Badge
                size="lg"
                radius="xl"
                color={habitatHealth.mantineColor}
                variant="light"
                style={{ flexShrink: 0, marginBottom: 4, fontWeight: 700 }}
              >
                Habitat Health: {habitatHealth.label}
              </Badge>
            )}
          </Group>
        </Box>

        {/* ── Section 1: KPI Cards ──────────────────────────────────────── */}
        <SimpleGrid cols={4} spacing="md">
          {[
            {
              icon: Bird, color: 'teal',
              label: 'Total Bird Observations',
              value: (meta?.total_birds_detected ?? stats.total).toLocaleString(),
              sub: `across ${meta?.total_images_processed ?? '—'} aerial images`,
              gradient: 'linear-gradient(140deg, #F0FDF9 0%, #ECFDF5 100%)',
              accent: '#2D6A4F',
            },
            {
              icon: MapPin, color: 'cyan',
              label: 'Active Monitoring Sites',
              value: String(surveys.length || filtered.length),
              sub: 'Louisiana coastal sites',
              gradient: 'linear-gradient(140deg, #F0F9FF 0%, #E0F2FE 100%)',
              accent: '#0284C7',
            },
            {
              icon: Leaf, color: 'green',
              label: `Dominant Species`,
              value: stats.top.split(' ').slice(0, 2).join(' '),
              sub: `${stats.species[0] ? ((stats.species[0].value / Math.max(stats.total, 1)) * 100).toFixed(0) + '% of observations' : 'By detected abundance'}`,
              gradient: 'linear-gradient(140deg, #F0FDF4 0%, #DCFCE7 100%)',
              accent: '#16A34A',
            },
            {
              icon: TrendingUp, color: 'indigo',
              label: 'Model Confidence',
              value: `${(stats.conf * 100).toFixed(0)}%`,
              sub: 'Detection reliability · YOLOv8',
              gradient: 'linear-gradient(140deg, #EEF2FF 0%, #E0E7FF 100%)',
              accent: '#4F46E5',
            },
          ].map(({ icon: Icon, color, label, value, sub, gradient, accent }) => (
            <Card
              key={label}
              radius="xl"
              p={0}
              style={{ ...cardStyle, overflow: 'hidden' }}
            >
              <Box style={{ background: gradient, padding: '22px 24px 24px' }}>
                <Group justify="space-between" align="flex-start" mb="md">
                  <ThemeIcon size={46} radius="xl" color={color} variant="light">
                    <Icon size={22} />
                  </ThemeIcon>
                  <Box w={8} h={8} style={{ borderRadius: '50%', backgroundColor: accent, marginTop: 6, opacity: 0.4 }} />
                </Group>
                <Text fz={38} fw={800} lh={1} c="dark.8" mb={6}>{value}</Text>
                <Text size="sm" fw={600} c="dark.5" lh={1.2}>{label}</Text>
                <Text size="xs" c="dimmed" mt={3}>{sub}</Text>
              </Box>
            </Card>
          ))}
        </SimpleGrid>

        {/* ── Sections 2 & 4: Species Distribution + Habitat Density ───── */}
        <SimpleGrid cols={2} spacing="md" style={{ alignItems: 'stretch' }}>

          {/* Species Distribution */}
          <Card radius="xl" p="xl" style={cardStyle}>
            <Heading icon={Bird} color="teal" title="Species Distribution" sub="By detected abundance" />
            {donutData.length === 0 ? (
              <Box h={200} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="dimmed" size="sm">No species data yet — upload an image to analyze</Text>
              </Box>
            ) : (
              <Group align="flex-start" gap="xl" wrap="nowrap">
                <DonutChart
                  data={donutData}
                  h={190} w={190}
                  thickness={30}
                  tooltipDataSource="segment"
                  withTooltip
                  paddingAngle={3}
                />
                <Stack gap="xs" style={{ flex: 1, paddingTop: 4 }}>
                  {donutData.map((s) => {
                    const pct = stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0;
                    return (
                      <Box key={s.name}>
                        <Group justify="space-between" mb={4}>
                          <Group gap={6} wrap="nowrap">
                            <Box w={9} h={9} style={{ borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                            <Text size="xs" c="dark.5" style={{ lineHeight: 1 }}>{s.name}</Text>
                          </Group>
                          <Text size="xs" fw={700} c="dark.7">{pct}%</Text>
                        </Group>
                        <Progress value={pct} color={s.color} radius="xl" size={6} />
                      </Box>
                    );
                  })}
                </Stack>
              </Group>
            )}
          </Card>

          {/* Bird Count by Habitat */}
          <Card radius="xl" p="xl" style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
            <Heading icon={TrendingUp} color="cyan" title="Bird Count by Habitat" sub="Aggregated abundance" />
            {stats.habitat.length === 0 ? (
              <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text c="dimmed" size="sm">No habitat data yet</Text>
              </Box>
            ) : (
              <Stack gap="md" style={{ flex: 1 }}>
                <BarChart
                  h={undefined}
                  style={{ flex: 1, minHeight: 180 }}
                  data={stats.habitat}
                  dataKey="name"
                  series={[{ name: 'Birds', color: '#52B788' }]}
                  orientation="vertical"
                  gridAxis="x"
                  withTooltip
                  referenceLines={avgHabitatBirds > 0 ? [{ x: avgHabitatBirds, color: 'gray.4', label: 'Avg' }] : []}
                  yAxisProps={{ width: 110, tick: { fontSize: 11 } }}
                  xAxisProps={{ tick: { fontSize: 11 } }}
                />

                {/* Habitat insight */}
                {stats.habitat.length > 0 && (() => {
                  const top    = stats.habitat[0];
                  const second = stats.habitat[1];
                  const topPct = stats.total > 0 ? Math.round((top.Birds / stats.total) * 100) : 0;
                  const diversity = stats.habitat.length >= 3 ? 'diverse habitat mix' : 'concentrated habitat use';
                  const trend = topPct >= 60
                    ? `${top.name} is the overwhelmingly dominant habitat, hosting ${topPct}% of all observations.`
                    : `${top.name} leads at ${topPct}%${second ? `, followed by ${second.name} — indicating a ${diversity} across monitored sites` : ''}.`;

                  return (
                    <Paper
                      radius="lg" p="sm"
                      style={{ background: 'linear-gradient(135deg, #F0FDF9, #F0F9FF)', border: '1px solid #99F6E433' }}
                    >
                      <Group gap="xs" align="flex-start" wrap="nowrap">
                        <Text style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>🌿</Text>
                        <Text size="xs" c="dark.5" lh={1.6}>{trend} {stats.habitat.length > 1 ? `${stats.habitat.length} distinct habitat types recorded.` : ''}</Text>
                      </Group>
                    </Paper>
                  );
                })()}
              </Stack>
            )}
          </Card>
        </SimpleGrid>

        {/* ── Section 3: Ecological Insights ───────────────────────────── */}
        {surveys.length > 0 && (
          <Card radius="xl" p="xl" style={cardStyle}>
            <Heading icon={Leaf} color="teal" title="Ecological Insights" sub="Powered by Gemini 2.5 Flash" />
            <SimpleGrid cols={Math.min(surveys.length, 3)} spacing="md">
              {surveys.map((sv: any, i: number) => {
                const cfg = RISK_CFG[sv.overall_risk_level] ?? RISK_CFG.medium;
                return (
                  <Paper
                    key={i} radius="lg" p="md"
                    style={{ background: cfg.bg, borderLeft: `4px solid ${cfg.border}`, border: `1px solid ${cfg.border}33`, borderLeftWidth: 4 }}
                  >
                    <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
                      <Box style={{ minWidth: 0 }}>
                        <Text fw={700} size="sm" c="dark.7" lh={1.3} truncate>{formatSiteName(sv.site_name)}</Text>
                        <Text size="xs" c="dimmed" mt={2}>{sv.survey_date}</Text>
                      </Box>
                      <Badge color={cfg.badge} variant="light" radius="xl" size="sm" style={{ flexShrink: 0 }}>
                        {sv.overall_risk_level?.toUpperCase()}
                      </Badge>
                    </Group>
                    <Group gap={4} mb="xs" style={{ flexWrap: 'wrap' }}>
                      {sv.bird_data?.estimated_classifications?.slice(0, 3).map((cls: any, j: number) => (
                        <Badge key={j} color="gray" variant="light" radius="xl" size="xs">
                          {cls.species.split(' ').slice(0, 2).join(' ')} · {cls.estimated_percentage}%
                        </Badge>
                      ))}
                    </Group>
                    {sv.gemini_notes && (
                      <Text size="xs" c="dimmed" lineClamp={2} mt="xs">{sv.gemini_notes}</Text>
                    )}
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Card>
        )}

        {/* ── Decision Card: Recommended Action ────────────────────────── */}
        {recommendation && (() => {
          const cfg = recPriorityCfg[recommendation.priority];
          return (
            <Card
              radius="xl" p={0}
              style={{ ...cardStyle, overflow: 'hidden' }}
            >
              <Box style={{ borderLeft: `5px solid ${cfg.border}`, background: cfg.bg }}>
                <Box p="xl">
                  <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
                    <Group gap="sm">
                      <ThemeIcon size={36} radius="xl" color={cfg.badge} variant="light">
                        <Target size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="sm" c="dark.7">Recommended Action</Text>
                        <Text size="xs" c="dimmed">AI-generated recommendation based on habitat + species analysis</Text>
                      </Box>
                    </Group>
                    <Badge color={cfg.badge} variant="filled" radius="xl" size="md" style={{ flexShrink: 0 }}>
                      {cfg.label}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dark.7" fw={500} lh={1.6} mb="md">
                    {recommendation.action}
                  </Text>

                  <Divider color="gray.2" mb="md" />

                  <SimpleGrid cols={2} spacing="xl">
                    <Box>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }} mb={4}>
                        Rationale
                      </Text>
                      <Text size="xs" c="dark.5" lh={1.6}>{recommendation.rationale}</Text>
                    </Box>
                    <Box>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }} mb={4}>
                        Habitat ↔ Species Connection
                      </Text>
                      <Text size="xs" c="dark.5" lh={1.6}>{recommendation.connection}</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Box>
            </Card>
          );
        })()}

        {/* ── Section 5: Environmental Context ─────────────────────────── */}
        {envStats && (
          <Card radius="xl" p="xl" style={cardStyle}>
            <Group justify="space-between" align="center" mb="lg">
              <Group gap="sm">
                <ThemeIcon size={34} radius="xl" color="blue" variant="light">
                  <Waves size={18} />
                </ThemeIcon>
                <Box>
                  <Text fw={600} size="sm" lh={1.2} c="dark.7">Environmental Context</Text>
                </Box>
              </Group>
              {habitatHealth && (
                <Badge
                  size="md" radius="xl"
                  color={habitatHealth.mantineColor}
                  variant="dot"
                  style={{ fontWeight: 600 }}
                >
                  Habitat Health: {habitatHealth.label}
                </Badge>
              )}
            </Group>

            <SimpleGrid cols={3} spacing="xl">
              {/* Habitat Condition */}
              <Stack gap="sm">
                <Group gap={6}>
                  <Shield size={13} color="#9CA3AF" />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    Habitat Condition
                  </Text>
                </Group>
                {Object.entries(envStats.cond).map(([c, n]) => (
                  <Group key={c} justify="space-between">
                    <Group gap="xs">
                      <Box w={10} h={10} style={{ borderRadius: '50%', backgroundColor: condColors[c] ?? '#9CA3AF', flexShrink: 0 }} />
                      <Text size="sm" tt="capitalize" c="dark.5">{c}</Text>
                    </Group>
                    <Badge color="gray" variant="light" radius="xl" size="xs">
                      {n} site{n !== 1 ? 's' : ''}
                    </Badge>
                  </Group>
                ))}
              </Stack>

              {/* Coastal Erosion Risk */}
              <Stack gap="sm">
                <Group gap={6}>
                  <Waves size={13} color="#9CA3AF" />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    Coastal Erosion Risk
                  </Text>
                </Group>
                {Object.entries(envStats.erosion).map(([level, n]) => {
                  const pct = Math.round((n / surveys.length) * 100);
                  return (
                    <Box key={level}>
                      <Group justify="space-between" mb={5}>
                        <Text size="xs" tt="capitalize" c="dark.5">{level} risk</Text>
                        <Text size="xs" fw={700} c="dark.6">{pct}%</Text>
                      </Group>
                      <Progress value={pct} color={erosionMantine[level] ?? 'gray'} radius="xl" size="md" />
                    </Box>
                  );
                })}
                {/* Paginated real-world erosion context */}
                {surveys.length > 0 && (() => {
                  const s = surveys[Math.min(erosionPage, surveys.length - 1)];
                  const risk = s.habitat_assessment?.coastal_erosion_risk;
                  return (
                    <Box mt={4}>
                      <Divider my={6} color="gray.2" />
                      <Group justify="space-between" align="center" mb={6}>
                        <Group gap={6}>
                          <Text size="xs" fw={600} c="dark.6">{formatSiteName(s.site_name)}</Text>
                          <Badge size="xs" radius="xl" variant="light"
                            color={risk === 'high' ? 'red' : risk === 'medium' ? 'yellow' : 'teal'}
                          >
                            {risk} erosion
                          </Badge>
                        </Group>
                        <Group gap={4}>
                          <button
                            onClick={() => setErosionPage(p => Math.max(0, p - 1))}
                            disabled={erosionPage === 0}
                            style={{
                              width: 22, height: 22, borderRadius: '50%', border: '1px solid #E5E7EB',
                              background: erosionPage === 0 ? '#F9FAFB' : 'white',
                              cursor: erosionPage === 0 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: erosionPage === 0 ? '#D1D5DB' : '#374151',
                              fontSize: 12, lineHeight: 1,
                            }}
                          >‹</button>
                          <Text size="xs" c="dimmed">{erosionPage + 1} / {surveys.length}</Text>
                          <button
                            onClick={() => setErosionPage(p => Math.min(surveys.length - 1, p + 1))}
                            disabled={erosionPage === surveys.length - 1}
                            style={{
                              width: 22, height: 22, borderRadius: '50%', border: '1px solid #E5E7EB',
                              background: erosionPage === surveys.length - 1 ? '#F9FAFB' : 'white',
                              cursor: erosionPage === surveys.length - 1 ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: erosionPage === surveys.length - 1 ? '#D1D5DB' : '#374151',
                              fontSize: 12, lineHeight: 1,
                            }}
                          >›</button>
                        </Group>
                      </Group>
                      {s.habitat_assessment?.description && (
                        <Text size="xs" c="dimmed" lh={1.6}>{s.habitat_assessment.description}</Text>
                      )}
                    </Box>
                  );
                })()}
              </Stack>

              {/* Climate Disturbances */}
              <Stack gap="sm">
                <Group gap={6}>
                  <Wind size={13} color="#9CA3AF" />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    Climate Disturbances
                  </Text>
                </Group>
                {envStats.hasDisturbance ? (
                  <Stack gap="xs">
                    {Object.entries(envStats.dist).map(([type, n]) => (
                      <Paper key={type} radius="md" p="xs" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                        <Group gap="xs">
                          <AlertTriangle size={14} color="#F59E0B" />
                          <Text size="xs" tt="capitalize" c="dark.5" style={{ flex: 1 }}>{type.replace(/_/g, ' ')}</Text>
                          <Text size="xs" fw={700} c="orange">{n}×</Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper radius="md" p="xs" style={{ background: '#F0FDF9', border: '1px solid #99F6E4' }}>
                    <Group gap="xs">
                      <CheckCircle size={14} color="#2D6A4F" />
                      <Text size="xs" c="teal" fw={600}>No recent disturbances</Text>
                    </Group>
                  </Paper>
                )}
                <Divider my={2} color="gray.2" />
                <Stack gap={6}>
                  {surveys
                    .filter((s: any) => s.climate_impact?.recovery_stage)
                    .map((s: any, i: number) => (
                      <Group key={i} justify="space-between">
                        <Text size="xs" c="dimmed" truncate style={{ maxWidth: '55%' }}>{formatSiteName(s.site_name)}</Text>
                        <Badge color="teal" variant="light" radius="xl" size="xs" tt="capitalize">
                          {s.climate_impact.recovery_stage}
                        </Badge>
                      </Group>
                    ))}
                </Stack>
              </Stack>
            </SimpleGrid>

            {/* Site Intelligence tabs */}
            {surveys.length > 0 && (
              <>
                <Divider my="lg" color="gray.2" label={
                  <Text size="xs" c="dimmed" fw={600}>Site Intelligence</Text>
                } labelPosition="left" />

                <Tabs defaultValue={surveys[0]?.site_name} radius="lg">
                  <Tabs.List mb="lg">
                    {surveys.map((sv: any) => (
                      <Tabs.Tab key={sv.site_name} value={sv.site_name} fw={500}>
                        {formatSiteName(sv.site_name)}
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>

                  {surveys.map((sv: any) => (
                    <Tabs.Panel key={sv.site_name} value={sv.site_name}>
                      <Stack gap="md">

                        {sv.gemini_notes && (
                          <Paper
                            radius="lg" p="md"
                            style={{ background: 'linear-gradient(135deg, #F0FDF9, #EFF6FF)', border: '1px solid #99F6E433' }}
                          >
                            <Group gap={6} mb={8}>
                              <Search size={13} color="#2D6A4F" />
                              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#2D6A4F' }}>
                                Real-world Context
                              </Text>
                            </Group>
                            <Text size="sm" c="dark.6" lh={1.7}>{sv.gemini_notes}</Text>
                          </Paper>
                        )}

                        {/* Research Findings — populated by Gemini Google Search */}
                        {sv.research_findings && (
                          <Paper radius="lg" p="md" style={{ background: '#FAFBFF', border: '1px solid #DBEAFE' }}>
                            <Group gap={6} mb="md">
                              <Globe size={13} color="#3B82F6" />
                              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#3B82F6' }}>
                                Web Research Findings
                              </Text>
                              <Badge size="xs" color="blue" variant="light" radius="xl" ml="auto">Google Search grounded</Badge>
                            </Group>
                            <SimpleGrid cols={2} spacing="sm" mb="sm">
                              {sv.research_findings.land_loss_rate && sv.research_findings.land_loss_rate !== 'unknown' && (
                                <Box>
                                  <Group gap={5} mb={4}>
                                    <Ruler size={12} color="#6B7280" />
                                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Land Loss Rate</Text>
                                  </Group>
                                  <Text size="sm" fw={600} c="dark.7">{sv.research_findings.land_loss_rate}</Text>
                                </Box>
                              )}
                              {sv.research_findings.historical_acreage && sv.research_findings.historical_acreage !== 'unknown' && (
                                <Box>
                                  <Group gap={5} mb={4}>
                                    <MapPin size={12} color="#6B7280" />
                                    <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Historical Acreage</Text>
                                  </Group>
                                  <Text size="sm" fw={600} c="dark.7">{sv.research_findings.historical_acreage}</Text>
                                </Box>
                              )}
                            </SimpleGrid>
                            {sv.research_findings.recent_storms?.length > 0 && (
                              <Box mb="sm">
                                <Group gap={5} mb={6}>
                                  <CloudLightning size={12} color="#F59E0B" />
                                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Recent Storms</Text>
                                </Group>
                                <Group gap="xs" wrap="wrap">
                                  {sv.research_findings.recent_storms.map((storm: string, i: number) => (
                                    <Badge key={i} size="xs" color="orange" variant="light" radius="xl">{storm}</Badge>
                                  ))}
                                </Group>
                              </Box>
                            )}
                            {sv.research_findings.known_nesting_species?.length > 0 && (
                              <Box mb="sm">
                                <Group gap={5} mb={6}>
                                  <Bird size={12} color="#2D6A4F" />
                                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Documented Nesting Species</Text>
                                </Group>
                                <Group gap="xs" wrap="wrap">
                                  {sv.research_findings.known_nesting_species.map((sp: string, i: number) => (
                                    <Badge key={i} size="xs" color="teal" variant="light" radius="xl">{sp}</Badge>
                                  ))}
                                </Group>
                              </Box>
                            )}
                            {sv.research_findings.restoration_projects?.length > 0 && sv.research_findings.restoration_projects[0] !== 'none known' && (
                              <Box mb="sm">
                                <Group gap={5} mb={6}>
                                  <Wrench size={12} color="#8B5CF6" />
                                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Restoration Projects</Text>
                                </Group>
                                <Stack gap={4}>
                                  {sv.research_findings.restoration_projects.map((proj: string, i: number) => (
                                    <Text key={i} size="xs" c="dark.5" lh={1.5}>· {proj}</Text>
                                  ))}
                                </Stack>
                              </Box>
                            )}
                            {sv.research_findings.data_sources?.length > 0 && (
                              <Box style={{ borderTop: '1px solid #DBEAFE', paddingTop: 8, marginTop: 4 }}>
                                <Text size="xs" c="dimmed" lh={1.6}>
                                  <Text span fw={600}>Sources: </Text>
                                  {sv.research_findings.data_sources.join(' · ')}
                                </Text>
                              </Box>
                            )}
                          </Paper>
                        )}

                        <SimpleGrid cols={3} spacing="md">
                          <Paper radius="lg" p="md" style={{ background: '#FAFAFA', border: '1px solid #E5E7EB' }}>
                            <Group gap={6} mb={8}>
                              <Bird size={13} color="#6B7280" />
                              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#6B7280' }}>Population Analysis</Text>
                            </Group>
                            <Badge color="teal" variant="light" radius="xl" size="sm" mb={8} tt="capitalize">
                              {sv.bird_data?.population_type?.replace(/_/g, ' ')}
                            </Badge>
                            <Text size="xs" c="dark.5" lh={1.65} mb="sm">{sv.bird_data?.population_type_reasoning ?? '—'}</Text>
                            <Stack gap={4}>
                              {sv.bird_data?.estimated_classifications?.map((cls: any, i: number) => (
                                <Group key={i} justify="space-between">
                                  <Text size="xs" c="dark.5" truncate style={{ flex: 1 }}>{cls.species}</Text>
                                  <Group gap={4}>
                                    <Text size="xs" fw={700} c="dark.7">{cls.estimated_percentage}%</Text>
                                    <Badge size="xs" color={cls.confidence === 'high' ? 'teal' : cls.confidence === 'medium' ? 'yellow' : 'gray'} variant="light" radius="xl">
                                      {cls.confidence}
                                    </Badge>
                                  </Group>
                                </Group>
                              ))}
                            </Stack>
                          </Paper>

                          <Paper radius="lg" p="md" style={{ background: '#FAFAFA', border: '1px solid #E5E7EB' }}>
                            <Group gap={6} mb={8}>
                              <TreePine size={13} color="#6B7280" />
                              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#6B7280' }}>Habitat Detail</Text>
                            </Group>
                            <Group gap="xs" mb={8}>
                              <Badge color={sv.habitat_assessment?.condition === 'healthy' ? 'teal' : sv.habitat_assessment?.condition === 'recovering' ? 'blue' : sv.habitat_assessment?.condition === 'stressed' ? 'yellow' : 'red'} variant="light" radius="xl" size="sm" tt="capitalize">
                                {sv.habitat_assessment?.condition}
                              </Badge>
                              <Badge color={sv.habitat_assessment?.coastal_erosion_risk === 'high' ? 'red' : sv.habitat_assessment?.coastal_erosion_risk === 'medium' ? 'yellow' : 'teal'} variant="light" radius="xl" size="sm">
                                {sv.habitat_assessment?.coastal_erosion_risk} erosion risk
                              </Badge>
                            </Group>
                            <Text size="xs" c="dark.5" lh={1.65}>{sv.habitat_assessment?.description ?? '—'}</Text>
                          </Paper>

                          <Paper
                            radius="lg" p="md"
                            style={{
                              background: sv.climate_impact?.recent_disturbance ? '#FFFBEB' : '#F0FDF9',
                              border: `1px solid ${sv.climate_impact?.recent_disturbance ? '#FDE68A' : '#99F6E433'}`,
                            }}
                          >
                            <Group gap={6} mb={8}>
                              <Zap size={13} color="#6B7280" />
                              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#6B7280' }}>Climate Context</Text>
                            </Group>
                            <Group gap="xs" mb={8}>
                              <Badge color={sv.climate_impact?.recent_disturbance ? 'orange' : 'teal'} variant="light" radius="xl" size="sm" tt="capitalize">
                                {sv.climate_impact?.disturbance_type === 'none' ? 'No disturbance' : sv.climate_impact?.disturbance_type}
                              </Badge>
                              <Badge color="gray" variant="light" radius="xl" size="sm" tt="capitalize">
                                {sv.climate_impact?.recovery_stage?.replace(/_/g, ' ')}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dark.5" lh={1.65}>{sv.climate_impact?.impact_reasoning ?? '—'}</Text>
                          </Paper>
                        </SimpleGrid>

                      </Stack>
                    </Tabs.Panel>
                  ))}
                </Tabs>
              </>
            )}
          </Card>
        )}

        {/* ── Section 6: Supporting Images ─────────────────────────────── */}
        {detections.length > 0 && (
          <Card radius="xl" p="xl" style={cardStyle}>
            <Group justify="space-between" mb="lg">
              <Heading icon={Bird} color="gray" title="Supporting Detection Images" sub="Highest bird density samples" />
              <Text size="xs" c="dimmed">{detections.length} annotated images</Text>
            </Group>
            <SimpleGrid cols={6} spacing="sm">
              {detections.slice(0, 6).map((det) => (
                <Box
                  key={det.id}
                  style={{
                    position: 'relative', borderRadius: 16, overflow: 'hidden',
                    aspectRatio: '1', background: '#F3F4F6',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <img
                    src={`${API_BASE}${det.imageUrl}`}
                    alt={`${det.birdCount} birds`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <Box
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.72), transparent)',
                      padding: '10px 8px 8px',
                    }}
                  >
                    <Text size="xs" fw={700} c="white">{det.birdCount} birds</Text>
                    <Text size="xs" c="rgba(255,255,255,0.7)" truncate>{det.siteName}</Text>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Card>
        )}

      </Stack>
    </Box>
  );
}
