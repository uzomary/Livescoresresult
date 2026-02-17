import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfUse = () => {
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
                            Terms of Use
                        </h1>
                        <p className="text-gray-500">
                            Last updated: February 10, 2026
                        </p>
                    </div>

                    <div className="prose prose-gray max-w-none text-gray-600 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using LiveScoresResult ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">2. Description of Service</h2>
                            <p>
                                LiveScoresResult provides users with access to real-time football scores, fixtures, standings, and related sports information. The Service is provided "as is" and is for informational purposes only.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">3. Use of Content</h2>
                            <p>
                                All content provided on this site is for personal, non-commercial use only. You may not modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information obtained from the Service without prior written consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">4. Accuracy of Information</h2>
                            <p>
                                While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">5. Betting & Gambling</h2>
                            <p>
                                LiveScoresResult is NOT a gambling site. Any information regarding odds or betting is for informational purposes only. We do not accept bets or provide gambling services. Users are responsible for complying with the laws and regulations in their own jurisdiction regarding online gambling.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">6. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. You should check this page regularly. Your continued use of the Service after any changes constitutes your acceptance of the new Terms of Use.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-[#00141e] mb-4">7. Contact Us</h2>
                            <p>
                                If you have any questions about these Terms, please contact us at support@livescoresresult.com.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
