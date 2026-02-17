import { ArrowLeft, Mail, BarChart, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Advertise = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-8 sm:p-12 text-center">
                        <div className="mb-8">
                            <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#00141e] transition-colors mb-6">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                            <h1 className="text-3xl sm:text-4xl font-black text-[#00141e] mb-4">
                                Advertise with LiveScoresResult
                            </h1>
                            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                                Reach millions of passionate football fans worldwide. Elevate your brand with our premium advertising solutions.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <Users className="w-10 h-10 text-[#ff0046] mx-auto mb-4" />
                                <h3 className="font-bold text-[#00141e] text-lg mb-2">Massive Reach</h3>
                                <p className="text-sm text-gray-600">Connect with a dedicated audience of sports enthusiasts from around the globe.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <BarChart className="w-10 h-10 text-[#ff0046] mx-auto mb-4" />
                                <h3 className="font-bold text-[#00141e] text-lg mb-2">High Engagement</h3>
                                <p className="text-sm text-gray-600">Our users spend significant time analyzing stats, scores, and match details.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-lg">
                                <Globe className="w-10 h-10 text-[#ff0046] mx-auto mb-4" />
                                <h3 className="font-bold text-[#00141e] text-lg mb-2">Global Coverage</h3>
                                <p className="text-sm text-gray-600">Target specific regions or run global campaigns across our platform.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#00141e] rounded-xl shadow-lg border border-gray-900 overflow-hidden text-white p-8 sm:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold mb-4">Ready to grow your brand?</h2>
                            <p className="text-gray-300 max-w-lg">
                                Contact our sales team today to discuss custom advertising packages tailored to your marketing goals.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#">
                                <Button className="bg-[#ff0046] hover:bg-[#d9003b] text-white font-bold py-6 px-8 rounded-lg text-lg w-full sm:w-auto">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Contact Sales
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Advertise;
