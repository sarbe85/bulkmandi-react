import RoleSelectionHeader from "@/components/layout/RoleSelectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Package, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: "BUYER",
      title: "Buyer",
      badge: "Purchase & RFQs",
      icon: Building2,
      features: [
        "Browse prices & raise RFQs",
        "Compare quotes & match seller",
        "Pay via escrow or accept on delivery",
      ],
      primaryAction: () => navigate("/auth/register?role=BUYER"),
    },
    {
      id: "SELLER",
      title: "Seller",
      badge: "List & Quote stock",
      icon: Package,
      features: [
        "Respond to RFQs or auto-match",
        "Dispatch with 3PL or self-pickup",
        "Get paid post acceptance",
      ],
      primaryAction: () => navigate("/auth/register?role=SELLER"),
    },
    {
      id: "3PL",
      title: "Logistics Provider (3PL)",
      badge: "Bid shipments & POD",
      icon: Truck,
      features: [
        "Bid on lanes & meet SLA pricing",
        "Live tracking & upload LR/POD",
        "Get paid post acceptance",
      ],
      primaryAction: () => navigate("/auth/register?role=3PL"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <RoleSelectionHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                Get verified to trade with escrow & tracked logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate("/auth/register")}>
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/auth/login")}
                >
                  Continue with Email/OTP
                </Button>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <p className="text-sm text-muted-foreground">
                Create once, trade as <strong>Buyer</strong>,{" "}
                <strong>Seller</strong>, or <strong>3PL</strong> under the same
                organization profile.
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                KYC Tips
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use official email domain for faster verification.</li>
                <li>• Keep GSTIN, PAN, and bank proof handy.</li>
                <li>• Penny-drop test credits ₹1 to validate payouts.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Role Selection */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Choose Your Role</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="flex flex-col hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{role.title}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {role.badge}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="mb-6 flex-1 space-y-2 text-sm text-muted-foreground">
                      {role.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-2">
                      <Button onClick={role.primaryAction}>
                        Start as {role.title}
                      </Button>
                      <Button variant="outline" size="sm">
                        Learn more
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RoleSelection;
