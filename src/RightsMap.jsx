import { useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Move, Network } from 'lucide-react'

function createNode(id, x, y, label, tone = 'neutral', width = 200) {
  const tones = {
    root: {
      background: '#0b0b0b',
      color: '#f8fafc',
      border: '2px solid #D4A017',
    },
    principle: {
      background: '#101614',
      color: '#d1fae5',
      border: '1px solid #006A4E',
    },
    right: {
      background: '#121212',
      color: '#f8fafc',
      border: '1px solid #3b82f6',
    },
    institution: {
      background: '#17111d',
      color: '#f3e8ff',
      border: '1px solid #7e22ce',
    },
    action: {
      background: '#180d11',
      color: '#ffe4e6',
      border: '1px solid #C8102E',
    },
    neutral: {
      background: '#151515',
      color: '#f8fafc',
      border: '1px solid #333333',
    },
  }

  return {
    id,
    position: { x, y },
    data: { label },
    draggable: true,
    style: {
      ...tones[tone],
      width,
      padding: '12px 14px',
      borderRadius: 16,
      fontSize: '13px',
      fontWeight: 600,
      lineHeight: 1.35,
      textAlign: 'center',
      boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
      whiteSpace: 'pre-line',
    },
  }
}

function createEdge(id, source, target, color, label) {
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    animated: false,
    label,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color,
      width: 18,
      height: 18,
    },
    style: {
      stroke: color,
      strokeWidth: 1.8,
    },
    labelStyle: {
      fill: '#cbd5e1',
      fontSize: 11,
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: 'rgba(7, 10, 14, 0.88)',
      stroke: 'rgba(71, 85, 105, 0.45)',
      rx: 8,
      ry: 8,
    },
  }
}

const MAP_NODES = [
  createNode('constitution', 470, 24, 'The Constitution\n(Supreme Law)', 'root', 220),
  createNode('values', 160, 150, 'Article 10\nNational Values\n& Public Participation', 'principle'),
  createNode('bill', 470, 150, 'Chapter Four\nBill of Rights', 'principle', 210),
  createNode('governance', 790, 150, 'Governance,\nDevolution\n& Public Finance', 'principle', 210),

  createNode('equality', 10, 320, 'Article 27\nEquality &\nNon-Discrimination', 'right'),
  createNode('privacy', 210, 320, 'Article 31\nPrivacy', 'right', 180),
  createNode('expression', 390, 320, 'Articles 33 & 37\nExpression,\nAssembly & Protest', 'right', 205),
  createNode('social', 610, 320, 'Article 43\nHealth, Water,\nHousing & Food', 'right', 205),
  createNode('admin', 830, 320, 'Article 47\nFair Administrative\nAction', 'right', 205),
  createNode('arrest', 1050, 320, 'Articles 49 & 50\nArrest Rights &\nFair Hearing', 'right', 205),

  createNode('land', 170, 510, 'Articles 40, 42,\n60 & 69\nLand, Property &\nEnvironment', 'right', 210),
  createNode('children', 430, 510, "Article 53\nChildren's Rights", 'right', 190),
  createNode('parliament', 670, 510, 'Parliament &\nCounty Assemblies', 'institution', 190),
  createNode('county', 890, 510, 'County Government\n& Public Service', 'institution', 200),
  createNode('commissions', 1110, 510, 'IPOA, KNCHR,\nCAJ, EACC,\nNLC & Others', 'institution', 205),

  createNode('complaints', 330, 720, 'Complaint,\nPetition,\nRequest for Reasons', 'action', 200),
  createNode('judiciary', 620, 720, 'Judiciary\n& Courts', 'institution', 180),
  createNode('remedies', 910, 720, 'Orders,\nCompensation,\nRelease,\nCompliance', 'action', 200),
]

const MAP_EDGES = [
  createEdge('e1', 'constitution', 'values', '#3ecfa0', 'guides'),
  createEdge('e2', 'constitution', 'bill', '#D4A017', 'protects'),
  createEdge('e3', 'constitution', 'governance', '#f47285', 'structures'),

  createEdge('e4', 'bill', 'equality', '#3b82f6', 'includes'),
  createEdge('e5', 'bill', 'privacy', '#3b82f6', 'includes'),
  createEdge('e6', 'bill', 'expression', '#3b82f6', 'includes'),
  createEdge('e7', 'bill', 'social', '#3b82f6', 'includes'),
  createEdge('e8', 'bill', 'admin', '#3b82f6', 'includes'),
  createEdge('e9', 'bill', 'arrest', '#3b82f6', 'includes'),
  createEdge('e10', 'bill', 'land', '#3b82f6', 'links'),
  createEdge('e11', 'bill', 'children', '#3b82f6', 'protects'),

  createEdge('e12', 'values', 'expression', '#006A4E', 'needs participation'),
  createEdge('e13', 'values', 'land', '#006A4E', 'guides public use'),
  createEdge('e14', 'governance', 'parliament', '#7e22ce', 'law-making'),
  createEdge('e15', 'governance', 'county', '#7e22ce', 'service delivery'),
  createEdge('e16', 'governance', 'commissions', '#7e22ce', 'oversight'),

  createEdge('e17', 'social', 'county', '#C8102E', 'often depends on'),
  createEdge('e18', 'admin', 'county', '#C8102E', 'can challenge'),
  createEdge('e19', 'expression', 'parliament', '#C8102E', 'petition / reform'),
  createEdge('e20', 'land', 'commissions', '#C8102E', 'oversight'),
  createEdge('e21', 'arrest', 'commissions', '#C8102E', 'police oversight'),

  createEdge('e22', 'county', 'complaints', '#f97316', 'complain to'),
  createEdge('e23', 'parliament', 'complaints', '#f97316', 'petition'),
  createEdge('e24', 'commissions', 'complaints', '#f97316', 'report to'),
  createEdge('e25', 'complaints', 'judiciary', '#f97316', 'escalate to'),
  createEdge('e26', 'arrest', 'judiciary', '#f97316', 'court protection'),
  createEdge('e27', 'land', 'judiciary', '#f97316', 'court action'),
  createEdge('e28', 'judiciary', 'remedies', '#f97316', 'issues'),
  createEdge('e29', 'commissions', 'remedies', '#f97316', 'pushes compliance'),
]

function RightsMap() {
  const [nodes, , onNodesChange] = useNodesState(MAP_NODES)
  const [edges, , onEdgesChange] = useEdgesState(MAP_EDGES)

  const mapSurfaceStyle = useMemo(
    () => ({
      minHeight: '680px',
      height: '72vh',
      maxHeight: '860px',
      background:
        'radial-gradient(circle at top, rgba(16, 24, 22, 0.55) 0%, rgba(10, 10, 10, 0.94) 46%, rgba(5, 5, 5, 1) 100%)',
    }),
    [],
  )

  return (
    <section className="animate-fade-up">
      <div className="mb-6">
        <span className="label text-ink-4 block mb-2">System View</span>
        <h2 className="headline text-fluid-2xl text-ink-1 font-semibold mb-2">
          Interactive Flow Map
        </h2>
        <p className="text-ink-3 max-w-3xl text-sm leading-relaxed">
          See how constitutional rights connect to institutions, complaints, and remedies.
          Drag the nodes around to follow the path from a right to the office or court that can help.
        </p>
      </div>

      <div
        className="glass-card relative w-full overflow-hidden"
        style={mapSurfaceStyle}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent z-10" />

        <div className="absolute top-4 left-4 z-20 bg-surface-3/90 backdrop-blur text-xs px-3 py-1.5 rounded-full border border-subtle flex items-center gap-2 text-ink-2 shadow-card">
          <Move className="w-3.5 h-3.5 text-blue-400" />
          Drag nodes to explore the constitutional path
        </div>

        <div className="absolute top-4 right-4 z-20 bg-surface-3/90 backdrop-blur text-xs px-3 py-1.5 rounded-full border border-subtle flex items-center gap-2 text-ink-2 shadow-card">
          <Network className="w-3.5 h-3.5 text-forest-bright" />
          {nodes.length} nodes
        </div>

        <div className="h-full w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.16 }}
            minZoom={0.45}
            maxZoom={1.5}
            nodesConnectable={false}
            elementsSelectable
            panOnDrag
            zoomOnScroll
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#232323" gap={18} />
            <MiniMap
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}
              nodeColor="#6b7280"
              maskColor="rgba(0,0,0,0.62)"
            />
            <Controls className="bg-surface-3 !border-subtle fill-white [&>button]:!border-subtle hover:[&>button]:bg-surface-4" />
          </ReactFlow>
        </div>
      </div>
    </section>
  )
}

export default RightsMap
