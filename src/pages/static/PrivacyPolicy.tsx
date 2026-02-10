import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 sm:p-12">
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-[#00141e] transition-colors mb-6">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-black text-[#00141e] mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-gray-500">
                            Last updated: February 10, 2026
                        </p>
                    </div>

                    <div className="prose prose-gray max-w-none text-gray-600 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">1. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us when you use our services, create an account, or communicate with us. This may include:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Usage data and user preferences</li>
                                <li>Device information and IP addresses</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Personalize your experience (e.g., favorite leagues/teams)</li>
                                <li>Analyze usage trends and optimize performance</li>
                                <li>Detect and prevent fraud or abuse</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">3. Cookies</h2>
                            <p>
                                We use cookies to enhance your browsing experience. Cookies are small data files stored on your device that help us remember your preferences and understand how you interact with our site. You can control cookie settings through your browser.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">4. Third-Party Services</h2>
                            <p>
                                We may use third-party services for analytics, advertising, and content delivery. These third parties may collect information about your online activities over time and across different websites.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">5. Data Security</h2>
                            <p>
                                We implement reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">6. Children's Privacy</h2>
                            <p>
                                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">7. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, please contact us at privacy@livescoresresult.com.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
