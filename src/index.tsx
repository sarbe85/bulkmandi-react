import { useAuth } from "@/features/auth/hooks/useAuth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ArrowRight, BarChart3, Building2, CheckCircle, FileText, Package, Shield, ShoppingCart, TrendingUp, Truck, Users, Zap } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getCurrentUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const user = getCurrentUser();
    console.log("User Role:", user);
    switch (user.role) {
      case "SELLER":
        navigate("/seller/dashboard");
        break;
      case "ADMIN":
        navigate("/admin/dashboard");
        break;
      case "BUYER":
        navigate("/buyer/dashboard");
        break;
      default:
        navigate("/dashboard");
        break;
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          <Badge variant="outline" className="px-4 py-2">
            <Zap className="h-3 w-3 mr-2" />
            India's Leading B2B Steel Marketplace
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Connect, Trade, and Grow
            <span className="block text-primary mt-3">Your Steel Business</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
            Join India's most trusted B2B steel platform. Whether you're buying, selling, or providing logistics—streamline your operations with
            verified partners and automated workflows.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button size="lg" onClick={() => navigate("/get-started")} className="text-lg px-10 py-6 shadow-lg">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth/login")} className="text-lg px-10 py-6">
              Sign In
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-muted-foreground">No Commission Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-muted-foreground">Verified Partners</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-muted-foreground">Quick Onboarding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">₹200Cr+</div>
              <div className="text-muted-foreground">Monthly GMV</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">RFQs per Month</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            For Every Business
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-primary">All Stakeholders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you're buying, selling, or delivering—we have the right tools for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Buyers */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">For Buyers</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Post RFQs, compare quotes from verified sellers, and manage orders—all in one place.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Create & manage RFQs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Compare multiple quotes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Track order delivery</span>
              </li>
            </ul>
          </Card>

          {/* Sellers */}
          <Card className="p-6 hover:shadow-lg transition-shadow border-primary/20">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">For Sellers</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Get matched with relevant RFQs, submit automated quotes, and manage your catalog efficiently.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Smart RFQ matching</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Automated quote generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Multi-location support</span>
              </li>
            </ul>
          </Card>

          {/* Logistics */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">For Logistics (3PL)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bid on lanes, manage shipments, and upload POD—streamline your logistics operations.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Bid on shipping lanes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Live shipment tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <span>Upload LR & POD documents</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Powerful tools designed specifically for the steel industry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered algorithm connects buyers with the right sellers based on catalog, capacity, and delivery zones.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-success/10 rounded-xl w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automated Workflows</h3>
              <p className="text-muted-foreground leading-relaxed">
                Submit quotes in minutes with pre-configured pricing, freight calculations, and validity periods.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Partners</h3>
              <p className="text-muted-foreground leading-relaxed">
                All users are GSTIN verified with credit checks. Trade with confidence knowing you're dealing with legitimate businesses.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-warning/10 rounded-xl w-fit mb-4">
                <Zap className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Updates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get instant notifications on new opportunities, quote status, and order updates. Never miss a beat.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-info/10 rounded-xl w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-info" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track your performance with detailed analytics on conversion rates, order values, and business trends.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Location</h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage multiple plant locations, dispatch coordination, and regional pricing from a single dashboard.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get Started in <span className="text-primary">3 Easy Steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Register & Verify</h3>
            <p className="text-muted-foreground">Quick 15-minute onboarding with GSTIN, PAN, and business verification</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Set Up Profile</h3>
            <p className="text-muted-foreground">Add your requirements, catalog, or fleet details based on your role</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Start Trading</h3>
            <p className="text-muted-foreground">Begin buying, selling, or managing shipments with verified partners instantly</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" onClick={() => navigate("/get-started")} className="px-8">
            Begin Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20 p-12 text-center">
          <Users className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join 500+ Successful Steel Businesses</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start connecting with verified partners today. No setup fees, no commissions, just pure business growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/get-started")} className="px-8">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth/login")} className="px-8">
              Sign In to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
