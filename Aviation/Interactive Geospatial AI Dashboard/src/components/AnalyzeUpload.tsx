import { useState, useRef } from 'react';
import {
  Card, Text, Title, Group, Stack, Badge, Progress,
  Select, Button, ThemeIcon, Paper, Box, SimpleGrid, Divider,
} from '@mantine/core';
import {
  Upload, Bird, AlertTriangle, CheckCircle, Leaf,
  Waves, Wind, TreePine, RotateCcw, Zap, Globe,
  Ruler, CloudLightning, Wrench, MapPin,
} from 'lucide-react';
import { analyzeImage } from '../services/apiService';

interface AnalyzeUploadProps {
  onSurveyAdded: () => void;
}

type Status = 'idle' | 'uploading' | 'done' | 'error';

const SITES = [
  { value: 'QueenBess',           label: 'Queen Bess' },
  { value: 'QueenBessIsland',     label: 'Queen Bess Island' },
  { value: 'HalfMoonIsland',      label: 'Half Moon Island' },
  { value: 'FelicityIsland',      label: 'Felicity Island' },
  { value: 'RaccoonIsland',       label: 'Raccoon Island' },
  { value: 'EastTimbalierIsland', label: 'East Timbalier Island' },
  { value: 'Other',               label: 'Other' },
];

const RISK_MANTINE: Record<string, string> = {
  high: 'red', medium: 'orange', low: 'teal',
};
const COND_MANTINE: Record<string, string> = {
  healthy: 'teal', recovering: 'blue', stressed: 'yellow', degraded: 'red',
};

const cardStyle = {
  border: '1px solid rgba(45,106,79,0.1)',
  boxShadow: '0 2px 12px rgba(45,106,79,0.06)',
};

export function AnalyzeUpload({ onSurveyAdded }: AnalyzeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [siteName, setSiteName] = useState<string | null>(null);
  const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus('idle');
    setResult(null);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('image/')) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !siteName) return;
    setStatus('uploading');
    setError('');
    try {
      const data = await analyzeImage(file, siteName, surveyDate);
      setResult(data);
      setStatus('done');
      onSurveyAdded();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSiteName(null);
    setStatus('idle');
    setResult(null);
    setError('');
  };

  const survey = result?.survey;

  return (
    <Box p="xl" style={{ background: '#F8FBF9', minHeight: '100%' }}>
      <Box maw={780} mx="auto">

        {/* Page header */}
        <Group gap="md" mb="xl">
          <div
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Upload size={20} color="white" />
          </div>
          <Box>
            <Title order={3} fw={700} c="dark.8" lh={1.2}>Analyze Aerial Image</Title>
            <Text size="sm" c="dimmed" mt={2}>
              Upload a survey photo — YOLOv8 detects birds, Gemini 2.5 Flash + Google Search generates the ecological report.
            </Text>
          </Box>
        </Group>

        {status !== 'done' && (
          <Card radius="xl" p="xl" mb="lg" style={cardStyle}>

            {/* Drop zone */}
            <Box
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${dragOver ? '#52B788' : file ? '#40916C' : '#D1FAE5'}`,
                borderRadius: 16,
                padding: file ? 0 : '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? '#F0FDF9' : file ? 'transparent' : '#FAFFFE',
                transition: 'all 0.18s ease',
                marginBottom: 24,
                overflow: 'hidden',
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {preview ? (
                <Box style={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
                  />
                  <Box
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                    }}
                  />
                  <Box style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                    <Group justify="space-between" align="flex-end">
                      <Text size="sm" fw={600} c="white">{file?.name}</Text>
                      <Button
                        size="xs" variant="white" radius="xl" color="dark"
                        onClick={e => { e.stopPropagation(); reset(); }}
                        style={{ opacity: 0.9 }}
                      >
                        Remove
                      </Button>
                    </Group>
                  </Box>
                </Box>
              ) : (
                <Stack align="center" gap="sm">
                  <ThemeIcon size={56} radius="xl" color="teal" variant="light">
                    <Upload size={26} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={600} c="dark.6" size="sm">Drop aerial image here or click to browse</Text>
                    <Text size="xs" c="dimmed" mt={4}>JPG · PNG · TIFF supported</Text>
                  </Box>
                </Stack>
              )}
            </Box>

            {/* Metadata row */}
            <SimpleGrid cols={2} spacing="md" mb="lg">
              <Box>
                <Text size="xs" fw={600} c="dark.5" tt="uppercase" style={{ letterSpacing: '0.05em' }} mb={6}>
                  Site Name *
                </Text>
                <Select
                  placeholder="Select a monitoring site..."
                  data={SITES}
                  value={siteName}
                  onChange={setSiteName}
                  radius="lg"
                  size="sm"
                  styles={{
                    input: { borderColor: 'rgba(45,106,79,0.2)', '&:focus': { borderColor: '#2D6A4F' } },
                  }}
                />
              </Box>
              <Box>
                <Text size="xs" fw={600} c="dark.5" tt="uppercase" style={{ letterSpacing: '0.05em' }} mb={6}>
                  Survey Date
                </Text>
                <input
                  type="date"
                  value={surveyDate}
                  onChange={e => setSurveyDate(e.target.value)}
                  style={{
                    width: '100%', border: '1px solid rgba(45,106,79,0.2)',
                    borderRadius: 12, padding: '8px 12px', fontSize: 14,
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    color: '#1F2937', background: 'white',
                  }}
                />
              </Box>
            </SimpleGrid>

            {/* AI pipeline info */}
            <Paper radius="lg" p="sm" mb="lg" style={{ background: 'linear-gradient(135deg, #F0FDF9, #EFF6FF)', border: '1px solid #99F6E433' }}>
              <Group gap="xs" wrap="nowrap">
                <Zap size={14} color="#2D6A4F" style={{ flexShrink: 0 }} />
                <Text size="xs" c="dark.5" lh={1.6}>
                  <Text span fw={600} c="dark.7">Analysis pipeline: </Text>
                  YOLOv8 counts every bird in the image → Gemini 2.5 Flash searches Google for site-specific erosion data, storm history &amp; LDWF reports → ecological JSON report generated.
                </Text>
              </Group>
            </Paper>

            <Button
              fullWidth
              size="md"
              radius="xl"
              loading={status === 'uploading'}
              disabled={!file || !siteName}
              onClick={handleSubmit}
              style={{
                background: (!file || !siteName) ? undefined : 'linear-gradient(135deg, #2D6A4F, #40916C)',
                fontWeight: 600, letterSpacing: '0.01em',
              }}
              leftSection={status !== 'uploading' ? <Bird size={18} /> : undefined}
            >
              {status === 'uploading' ? 'Running YOLO + Gemini analysis…' : 'Analyze Image'}
            </Button>

            {status === 'uploading' && (
              <Paper radius="lg" p="md" mt="md" style={{ background: '#F0FDF9', border: '1px solid #D1FAE5' }}>
                <Text size="xs" fw={600} c="teal.8" mb={8}>Processing your survey image…</Text>
                <Stack gap={6}>
                  {[
                    'Running YOLOv8 bird detection',
                    'Searching Google for site data',
                    'Generating Gemini ecological report',
                  ].map((step, i) => (
                    <Group key={i} gap="xs">
                      <Box style={{ width: 6, height: 6, borderRadius: '50%', background: '#52B788', flexShrink: 0 }} />
                      <Text size="xs" c="dark.5">{step}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            )}

            {status === 'error' && (
              <Paper radius="lg" p="md" mt="md" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <Group gap="xs" align="flex-start" wrap="nowrap">
                  <AlertTriangle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <Text size="sm" c="red.7">{error}</Text>
                </Group>
              </Paper>
            )}
          </Card>
        )}

        {/* ── Result card ── */}
        {status === 'done' && survey && (
          <Stack gap="md">

            {/* Success banner */}
            <Paper radius="xl" p="md" style={{ background: 'linear-gradient(135deg, #F0FDF9, #ECFDF5)', border: '1px solid #6EE7B7' }}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                    <CheckCircle size={20} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} c="teal.9" size="sm">Analysis complete — survey added to dashboard</Text>
                    <Text size="xs" c="teal.7" mt={2}>
                      {result.bird_count?.toLocaleString()} birds detected · {survey.site_name?.replace(/([A-Z])/g, ' $1').trim()} · {survey.survey_date}
                    </Text>
                  </Box>
                </Group>
                <Button
                  variant="subtle" color="teal" size="xs" radius="xl"
                  leftSection={<RotateCcw size={13} />}
                  onClick={reset}
                >
                  Analyze another
                </Button>
              </Group>
            </Paper>

            <Card radius="xl" p="xl" style={cardStyle}>
              {/* Header */}
              <Group justify="space-between" mb="lg">
                <Group gap="md">
                  <ThemeIcon size={42} radius="xl" color="teal" variant="light">
                    <Leaf size={20} />
                  </ThemeIcon>
                  <Box>
                    <Title order={4} fw={700} c="dark.8">
                      {survey.site_name?.replace(/([A-Z])/g, ' $1').trim()}
                    </Title>
                    <Text size="xs" c="dimmed">{survey.survey_date}</Text>
                  </Box>
                </Group>
                <Badge
                  size="lg" radius="xl" variant="light"
                  color={RISK_MANTINE[survey.overall_risk_level] ?? 'gray'}
                >
                  {survey.overall_risk_level?.toUpperCase()} RISK
                </Badge>
              </Group>

              {/* Species */}
              {survey.bird_data?.estimated_classifications?.length > 0 && (
                <>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }} mb="sm">
                    Detected Species
                  </Text>
                  <Stack gap="xs" mb="lg">
                    {survey.bird_data.estimated_classifications.map((cls: any, i: number) => (
                      <Box key={i}>
                        <Group justify="space-between" mb={4}>
                          <Group gap="xs">
                            <Bird size={12} color="#52B788" />
                            <Text size="xs" c="dark.6" fw={500}>{cls.species}</Text>
                          </Group>
                          <Group gap={6}>
                            <Text size="xs" fw={700} c="dark.7">{cls.estimated_percentage}%</Text>
                            <Badge size="xs" radius="xl" variant="light"
                              color={cls.confidence === 'high' ? 'teal' : cls.confidence === 'medium' ? 'yellow' : 'gray'}
                            >
                              {cls.confidence}
                            </Badge>
                          </Group>
                        </Group>
                        <Progress value={cls.estimated_percentage} color="#52B788" radius="xl" size={6} />
                      </Box>
                    ))}
                  </Stack>
                </>
              )}

              <Divider color="gray.1" mb="lg" />

              {/* Habitat + Climate */}
              <SimpleGrid cols={2} spacing="md" mb="lg">
                <Paper radius="lg" p="md" style={{ background: '#FAFFFE', border: '1px solid #D1FAE5' }}>
                  <Group gap={6} mb={8}>
                    <TreePine size={13} color="#2D6A4F" />
                    <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#2D6A4F' }}>Habitat</Text>
                  </Group>
                  <Group gap="xs" mb={8}>
                    <Badge size="sm" radius="xl" variant="light"
                      color={COND_MANTINE[survey.habitat_assessment?.condition] ?? 'gray'}
                      tt="capitalize"
                    >
                      {survey.habitat_assessment?.condition}
                    </Badge>
                    <Badge size="sm" radius="xl" variant="light"
                      color={RISK_MANTINE[survey.habitat_assessment?.coastal_erosion_risk] ?? 'gray'}
                    >
                      {survey.habitat_assessment?.coastal_erosion_risk} erosion
                    </Badge>
                  </Group>
                  <Text size="xs" c="dark.5" lh={1.65}>{survey.habitat_assessment?.description}</Text>
                </Paper>

                <Paper radius="lg" p="md"
                  style={{
                    background: survey.climate_impact?.recent_disturbance ? '#FFFBEB' : '#F0FDF9',
                    border: `1px solid ${survey.climate_impact?.recent_disturbance ? '#FDE68A' : '#D1FAE5'}`,
                  }}
                >
                  <Group gap={6} mb={8}>
                    <Wind size={13} color="#6B7280" />
                    <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#6B7280' }}>Climate Impact</Text>
                  </Group>
                  <Group gap="xs" mb={8}>
                    <Badge size="sm" radius="xl" variant="light"
                      color={survey.climate_impact?.recent_disturbance ? 'orange' : 'teal'}
                    >
                      {survey.climate_impact?.disturbance_type === 'none'
                        ? 'No disturbance'
                        : survey.climate_impact?.disturbance_type}
                    </Badge>
                    <Badge size="sm" radius="xl" variant="light" color="gray" tt="capitalize">
                      {survey.climate_impact?.recovery_stage}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dark.5" lh={1.65}>{survey.climate_impact?.impact_reasoning}</Text>
                </Paper>
              </SimpleGrid>

              {/* Gemini notes */}
              {survey.gemini_notes && (
                <Paper radius="lg" p="md" mb="md"
                  style={{ background: 'linear-gradient(135deg, #F0FDF9, #EFF6FF)', border: '1px solid #99F6E433' }}
                >
                  <Group gap={6} mb={8}>
                    <Waves size={13} color="#2D6A4F" />
                    <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#2D6A4F' }}>
                      Coastal Context
                    </Text>
                  </Group>
                  <Text size="sm" c="dark.6" lh={1.7}>{survey.gemini_notes}</Text>
                </Paper>
              )}

              {/* Research findings */}
              {survey.research_findings && (
                <Paper radius="lg" p="md" style={{ background: '#FAFBFF', border: '1px solid #DBEAFE' }}>
                  <Group gap={6} mb="md">
                    <Globe size={13} color="#3B82F6" />
                    <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.06em', color: '#3B82F6' }}>
                      Web Research Findings
                    </Text>
                    <Badge size="xs" color="blue" variant="light" radius="xl" ml="auto">
                      Google Search grounded
                    </Badge>
                  </Group>

                  <SimpleGrid cols={2} spacing="sm" mb="sm">
                    {survey.research_findings.land_loss_rate && survey.research_findings.land_loss_rate !== 'unknown' && (
                      <Box>
                        <Group gap={5} mb={4}>
                          <Ruler size={11} color="#6B7280" />
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Land Loss Rate</Text>
                        </Group>
                        <Text size="sm" fw={600} c="dark.7">{survey.research_findings.land_loss_rate}</Text>
                      </Box>
                    )}
                    {survey.research_findings.historical_acreage && survey.research_findings.historical_acreage !== 'unknown' && (
                      <Box>
                        <Group gap={5} mb={4}>
                          <MapPin size={11} color="#6B7280" />
                          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Historical Acreage</Text>
                        </Group>
                        <Text size="sm" fw={600} c="dark.7">{survey.research_findings.historical_acreage}</Text>
                      </Box>
                    )}
                  </SimpleGrid>

                  {survey.research_findings.recent_storms?.length > 0 && (
                    <Box mb="sm">
                      <Group gap={5} mb={6}>
                        <CloudLightning size={11} color="#F59E0B" />
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Recent Storms</Text>
                      </Group>
                      <Group gap="xs" wrap="wrap">
                        {survey.research_findings.recent_storms.map((s: string, i: number) => (
                          <Badge key={i} size="xs" color="orange" variant="light" radius="xl">{s}</Badge>
                        ))}
                      </Group>
                    </Box>
                  )}

                  {survey.research_findings.known_nesting_species?.length > 0 && (
                    <Box mb="sm">
                      <Group gap={5} mb={6}>
                        <Bird size={11} color="#2D6A4F" />
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Documented Nesting Species</Text>
                      </Group>
                      <Group gap="xs" wrap="wrap">
                        {survey.research_findings.known_nesting_species.map((sp: string, i: number) => (
                          <Badge key={i} size="xs" color="teal" variant="light" radius="xl">{sp}</Badge>
                        ))}
                      </Group>
                    </Box>
                  )}

                  {survey.research_findings.restoration_projects?.length > 0 &&
                    survey.research_findings.restoration_projects[0] !== 'none known' && (
                    <Box mb="sm">
                      <Group gap={5} mb={6}>
                        <Wrench size={11} color="#8B5CF6" />
                        <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>Restoration Projects</Text>
                      </Group>
                      <Stack gap={3}>
                        {survey.research_findings.restoration_projects.map((p: string, i: number) => (
                          <Text key={i} size="xs" c="dark.5" lh={1.5}>· {p}</Text>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {survey.research_findings.data_sources?.length > 0 && (
                    <Box style={{ borderTop: '1px solid #DBEAFE', paddingTop: 8, marginTop: 4 }}>
                      <Text size="xs" c="dimmed" lh={1.6}>
                        <Text span fw={600}>Sources: </Text>
                        {survey.research_findings.data_sources.join(' · ')}
                      </Text>
                    </Box>
                  )}
                </Paper>
              )}
            </Card>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
