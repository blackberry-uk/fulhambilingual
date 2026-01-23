import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { RELATIONSHIP_LABELS_EN } from './constants';
import { RelationshipKey } from './types';

interface AnalyticsData {
    totalSignatures: number;
    relationshipBreakdown: { [key: string]: number };
    yearGroupBreakdown: { [key: string]: number };
    languageBreakdown: { EN: number; FR: number };
    consentRate: number;
    testimonialsCount: number;
    debugRawYearGroups?: string[];
    debugNormalizedCounts?: { [key: string]: number };
}

const Analytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const persons = await storage.getSafeAnalyticsPersons();
            const records = await storage.getSafeAnalyticsRecords();

            // Relationship breakdown
            const relationshipCounts: { [key: string]: number } = {};
            persons.forEach(person => {
                person.relationship_to_school?.forEach(rel => {
                    const label = RELATIONSHIP_LABELS_EN[rel as RelationshipKey] || rel;
                    relationshipCounts[label] = (relationshipCounts[label] || 0) + 1;
                });
            });

            // Year group breakdown with fuzzy normalization
            // Normalize variations like GSA, GSB, GSC -> GS
            const yearGroupCounts: { [key: string]: number } = {};
            const rawYearGroups: string[] = [];
            persons.forEach(person => {
                person.student_year_groups?.forEach(year => {
                    rawYearGroups.push(year);
                    // Normalize year groups: GSA/GSB/GSC -> GS, PSA/PSB -> PS, etc.
                    // Trim whitespace and normalize to uppercase first
                    const trimmed = year.trim().toUpperCase();
                    // Match patterns like "GSB", "GS-B", "GS B", etc. and extract just the base grade
                    const normalized = trimmed.replace(/^(PS|MS|GS|CP|CE1|CE2|CM1|CM2)[\s\-]?[A-Z]?$/i, '$1').toUpperCase();
                    yearGroupCounts[normalized] = (yearGroupCounts[normalized] || 0) + 1;
                });
            });

            console.log('📊 Raw year groups from DB:', [...new Set(rawYearGroups)].sort());
            console.log('📊 Normalized year group counts:', yearGroupCounts);

            // Language breakdown
            const languageCounts = { EN: 0, FR: 0 };
            persons.forEach(person => {
                if (person.submission_language === 'EN') languageCounts.EN++;
                else languageCounts.FR++;
            });

            // Consent rate
            const withConsent = records.filter(r => r.consent_public_use).length;
            const consentRate = (withConsent / records.length) * 100;

            // Testimonials count
            const testimonials = await storage.getTestimonials();

            setData({
                totalSignatures: persons.length,
                relationshipBreakdown: relationshipCounts,
                yearGroupBreakdown: yearGroupCounts,
                languageBreakdown: languageCounts,
                consentRate,
                testimonialsCount: testimonials.length,
                debugRawYearGroups: [...new Set(rawYearGroups)].sort(),
                debugNormalizedCounts: yearGroupCounts
            });
        } catch (err) {
            console.error('Failed to load analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-400">Loading analytics...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-2xl font-bold text-red-500">Failed to load analytics</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">📊 Campaign Analytics</h1>
                    <p className="text-gray-500 font-medium">Internal dashboard - Not for public distribution</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                        <div className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">Total Signatures</div>
                        <div className="text-4xl font-black text-[#d52b27]">{data.totalSignatures}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                        <div className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">Testimonials</div>
                        <div className="text-4xl font-black text-[#d52b27]">{data.testimonialsCount}</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                        <div className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">Consent Rate</div>
                        <div className="text-4xl font-black text-[#d52b27]">{data.consentRate.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
                        <div className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">EN / FR Split</div>
                        <div className="text-2xl font-black text-gray-700">{data.languageBreakdown.EN} / {data.languageBreakdown.FR}</div>
                    </div>
                </div>

                {/* Debug Info */}
                <div className="bg-yellow-50 rounded-2xl p-8 shadow-sm border-2 border-yellow-200 mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">🐛 Debug Info</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="font-bold text-gray-700 mb-2">Raw Year Groups from Database:</div>
                            <div className="bg-white p-4 rounded-lg font-mono text-sm">
                                {data.debugRawYearGroups?.join(', ') || 'None'}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-gray-700 mb-2">Normalized Counts:</div>
                            <div className="bg-white p-4 rounded-lg font-mono text-sm">
                                {JSON.stringify(data.debugNormalizedCounts, null, 2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Relationship Breakdown */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100 mb-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Relationship to School</h2>
                    <div className="space-y-4">
                        {Object.entries(data.relationshipBreakdown)
                            .sort((a, b) => (b[1] as number) - (a[1] as number))
                            .map(([relationship, count]) => {
                                const percentage = ((count as number) / data.totalSignatures) * 100;
                                return (
                                    <div key={relationship}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700">{relationship}</span>
                                            <span className="text-sm font-black text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div
                                                className="bg-[#d52b27] h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Year Group Breakdown */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-6">Year Groups</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(data.yearGroupBreakdown)
                            .sort((a, b) => {
                                // Sort by year group order
                                const order = ['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];
                                return order.indexOf(a[0]) - order.indexOf(b[0]);
                            })
                            .map(([year, count]) => (
                                <div key={year} className="bg-gray-50 rounded-xl p-4 text-center border-2 border-gray-100">
                                    <div className="text-2xl font-black text-[#d52b27]">{count}</div>
                                    <div className="text-sm font-bold text-gray-600 mt-1">{year}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
