// ============= SELLER MOCK DATA =============

export const mockSellerUser = {
  id: "SEL-001",
  email: "seller@abc-steels.com",
  role: "SELLER",
  organizationId: "org_seller_456",
  organizationName: "ABC Steels Pvt Ltd",
  mobile: "+919876543210",
  onboardingCompleted: true,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockRFQs = [
  {
    rfqId: "RFQ-2481",
    rfqNumber: "#2481",
    buyer: {
      name: "Shree Constructions Pvt Ltd",
      location: "Bhubaneswar",
      rating: 4.2,
    },
    product: {
      category: "HR Coils",
      grade: "IS2062 E250",
      quantity: 200,
      unit: "MT",
    },
    incoterms: "DAP",
    targetPin: "751001",
    needByDate: "2024-10-10",
    status: "OPEN",
    expiryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    suggestedMatch: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    rfqId: "RFQ-2480",
    rfqNumber: "#2480",
    buyer: {
      name: "Metro Infrastructure Ltd",
      location: "Raipur",
      rating: 4.5,
    },
    product: {
      category: "TMT Bars",
      grade: "Fe500D",
      quantity: 150,
      unit: "MT",
    },
    incoterms: "EXW",
    targetPin: "492001",
    needByDate: "2024-10-15",
    status: "OPEN",
    expiryAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    suggestedMatch: true,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockOrders = [
  {
    orderId: "ORD-1001",
    orderNumber: "#1001",
    rfqNumber: "#2481",
    buyer: {
      name: "Shree Constructions Pvt Ltd",
      location: "Bhubaneswar",
    },
    product: {
      name: "HR Coils - IS2062 E250",
      quantity: 200,
      unit: "MT",
    },
    pricing: {
      pricePerMT: 45000,
      freightPerMT: 2000,
      totalValue: 9400000,
    },
    status: "IN_PROGRESS",
    deliveryDate: "2024-10-10",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    orderId: "ORD-1000",
    orderNumber: "#1000",
    rfqNumber: "#2475",
    buyer: {
      name: "Metro Infrastructure Ltd",
      location: "Raipur",
    },
    product: {
      name: "TMT Bars - Fe500D",
      quantity: 150,
      unit: "MT",
    },
    pricing: {
      pricePerMT: 48000,
      freightPerMT: 1800,
      totalValue: 7470000,
    },
    status: "DELIVERED",
    deliveryDate: "2024-10-05",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockShipments = [
  {
    shipmentId: "SHP-312",
    orderId: "ORD-1001",
    carrierId: "3PL-001",
    carrierName: "LogisticsX",
    vehicle: {
      type: "25t",
      number: "CG-12-AB-1234",
    },
    status: "IN_TRANSIT",
    pickupSlot: "2024-10-07T10:00:00Z",
    milestones: [
      {
        event: "PICKUP",
        timestamp: "2024-10-07T10:05:00Z",
        location: "Raipur",
      },
      {
        event: "IN_TRANSIT",
        timestamp: "2024-10-08T12:30:00Z",
        location: "Toll plaza",
      },
    ],
    documents: {
      qc: null,
      lr: null,
      wb: null,
      pod: null,
    },
  },
];

export const mockSellerDashboard = {
  kpis: {
    openRfqs: 12,
    quotesPendingAction: 3,
    ordersToDispatch: 2,
  },
  tasks: [
    {
      type: "COMPLETE_KYC",
      completed: false,
      priority: "HIGH",
      title: "Complete KYC Verification",
      description: "Submit required documents for verification",
    },
    {
      type: "SET_CATALOG",
      completed: false,
      priority: "MEDIUM",
      title: "Set Up Product Catalog",
      description: "Add your product categories and pricing",
    },
    {
      type: "SUBMIT_QUOTE",
      completed: false,
      priority: "HIGH",
      title: "Submit Pending Quotes",
      description: "3 quotes require your attention",
    },
  ],
  recentRfqs: mockRFQs,
};

// ============= ADMIN MOCK DATA =============

export const mockAdminUser = {
  id: "ADMIN-001",
  email: "admin@bulkmandi.com",
  role: "ADMIN",
  organizationId: "org_admin_789",
  organizationName: "BulkMandi Admin",
  mobile: "+911234567890",
  onboardingCompleted: true,
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockKYCCases = [
  {
    caseId: "KYC-BUY-001",
    orgId: "ORG-001",
    orgName: "Shree Constructions Pvt Ltd",
    role: "BUYER",
    status: "SUBMITTED",
    gstin: "27AAECS1Z5",
    pan: "AAECS1234K",
    bank: {
      account: "****1234",
      bankName: "HDFC",
      ifsc: "HDFC0001234",
      pennyDropScore: 98,
    },
    autoChecks: {
      gstin: "PASS",
      pan: "PASS",
      bank: { status: "PASS", score: 98, utr: "12345678" },
      watchlist: "CLEAR",
      blacklist: "CLEAR",
    },
    docs: [
      { type: "GST", status: "UPLOADED", url: "/docs/gst.pdf" },
      { type: "PAN", status: "UPLOADED", url: "/docs/pan.jpg" },
    ],
    ageMinutes: 45,
    assignedTo: null,
    notes: "",
    submittedAt: "2024-10-07T10:00:00Z",
  },
];

export const mockPriceFlags = [
  {
    flagId: "FLAG-001",
    refId: "RFQ-24-001",
    refType: "RFQ",
    sellerId: "SEL-001",
    sellerName: "ABC Steels",
    quotePrice: 51900,
    indexPrice: 45250,
    deviationPct: 14.7,
    zScore: 2.9,
    riskLevel: "HIGH",
    createdAt: "2024-10-07T10:05:00Z",
    sellerHistory: {
      winRate: 42,
      typicalDeviation: 3.2,
      floorSet: 45000,
      last30dFlags: 1,
    },
    actions: [],
  },
];

export const mockDisputes = [
  {
    disputeId: "DSP-1032",
    orderId: "ORD-1001",
    type: "SHORTAGE",
    claimant: "BUYER",
    value: 1260000,
    status: "IN_REVIEW",
    createdAt: "2024-10-09T15:25:00Z",
    buyerName: "Shree Constructions",
    sellerName: "ABC Steels",
    evidence: [
      {
        type: "PHOTO",
        url: "/evidence/photo1.jpg",
        uploadedAt: "2024-10-09T15:30:00Z",
      },
      {
        type: "WB_SLIP",
        url: "/evidence/wb.jpg",
        uploadedAt: "2024-10-09T15:32:00Z",
      },
    ],
    timeline: [
      { event: "DISPUTE_RAISED", ts: "2024-10-09T15:25:00Z", actor: "BUYER" },
      { event: "ADMIN_ASSIGNED", ts: "2024-10-09T15:35:00Z", actor: "SYSTEM" },
    ],
    decision: null,
  },
];

export const mockSettlementBatches = [
  {
    batchId: "ST-2024-10A",
    window: "01-10 Oct",
    items: [
      {
        partyId: "SEL-001",
        partyName: "ABC Steels",
        partyType: "SELLER",
        orderCount: 3,
        grossAmount: 932000000,
        platformFee: 210000,
        taxes: 0,
        netPayable: 931790000,
        status: "READY",
      },
      {
        partyId: "3PL-001",
        partyName: "LogisticsX",
        partyType: "3PL",
        orderCount: 5,
        grossAmount: 41000000,
        platformFee: 6000,
        taxes: 0,
        netPayable: 40994000,
        status: "READY",
      },
    ],
    totals: {
      gross: 1348000000,
      fees: 121000,
      taxes: 102000000,
      net: 1246877000,
    },
    status: "READY",
    createdAt: "2024-10-08T16:00:00Z",
  },
];

export const mockAdminDashboard = {
  kpis: {
    kycPending: 12,
    priceFlags: 8,
    disputesPending: 3,
    settlementReady: 2,
  },
  recentActivity: [
    {
      id: "1",
      type: "USER_REGISTERED",
      user: "Steel Manufacturing Ltd",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: "New seller registered",
    },
    {
      id: "2",
      type: "ORDER_PLACED",
      user: "Shree Constructions",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      details: "Order #1001 placed - ₹94L",
    },
    {
      id: "3",
      type: "KYC_APPROVED",
      user: "Metro Infrastructure Ltd",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      details: "KYC verification approved",
    },
    {
      id: "4",
      type: "RFQ_CREATED",
      user: "BuildRight Corp",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      details: "RFQ #2481 created - HR Coils",
    },
  ],
};

// ============= HELPER FUNCTIONS =============

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN");
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-IN");
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "success",
    CLOSED: "danger",
    DRAFT: "info",
    SUBMITTED: "warning",
    APPROVED: "success",
    REJECTED: "danger",
    PENDING: "warning",
    IN_PROGRESS: "info",
    COMPLETED: "success",
    IN_REVIEW: "warning",
    READY: "success",
  };
  return colors[status] || "default";
}
