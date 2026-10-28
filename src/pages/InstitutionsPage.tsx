import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Institution, FDRRecord } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Mail,
  Phone,
  Eye,
  X,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InstitutionsPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Selected institution for modal portfolio view
  const [activeInst, setActiveInst] = useState<(Institution & { records: FDRRecord[] }) | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const data = await api.getInstitutions();
      setInstitutions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleInspectInstitution = async (inst: Institution) => {
    setModalLoading(true);
    try {
      const data = await api.getInstitution(inst.id);
      setActiveInst(data);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = institutions.filter(inst => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      inst.name.toLowerCase().includes(q) ||
      inst.code.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.state.toLowerCase().includes(q);

    const matchType = selectedType === 'ALL' || inst.type === selectedType;
    return matchSearch && matchType;
  });

  const totalColleges = institutions.length;
  const compliantCount = institutions.filter(i => i.complianceStatus === 'Compliant').length;
  const totalGuarantees = institutions.reduce((sum, i) => sum + i.totalValue, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Approved Institutions Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional compliance directory, AICTE Permanent IDs, and security deposit commitments.
          </p>
        </div>

        <button
          onClick={fetchInstitutions}
          className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Directory
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Approved Institutions</span>
            <div className="text-xl font-extrabold text-slate-900">{totalColleges} Institutions</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compliant Deposits</span>
            <div className="text-xl font-extrabold text-emerald-800">{compliantCount} Fully Verified</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secured FDR Capital</span>
            <div className="text-xl font-extrabold text-teal-800">
              ₹{(totalGuarantees / 10000000).toFixed(2)} Crores
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by college name, permanent AICTE code, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-teal-500"
          >
            <option value="ALL">All Categories</option>
            <option value="University">University</option>
            <option value="Engineering College">Engineering College</option>
            <option value="Polytechnic">Polytechnic</option>
            <option value="Management Institute">Management Institute</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
          Institutions List ({filtered.length})
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
            <span>Loading institution records...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No institutions matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Permanent AICTE Code</th>
                  <th className="py-3 px-4">Institution Name & Type</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Total FDRs</th>
                  <th className="py-3 px-4">Total Guarantee Value</th>
                  <th className="py-3 px-4">Compliance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(inst => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {inst.code}
                    </td>
                    <td className="py-3 px-4 max-w-[250px]">
                      <span className="font-semibold text-slate-900 block truncate" title={inst.name}>
                        {inst.name}
                      </span>
                      <span className="text-[10px] text-slate-500">{inst.type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span>{inst.city}, {inst.state}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {inst.totalDeposits} Fixed Deposits
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-800">
                      ₹{(inst.totalValue / 100000).toFixed(2)} Lakhs
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${inst.complianceStatus === 'Compliant' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : inst.complianceStatus === 'Pending Review' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}
                      >
                        {inst.complianceStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleInspectInstitution(inst)}
                        className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-semibold text-xs flex items-center gap-1 transition-colors ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Portfolio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Institution Portfolio Modal */}
      {activeInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{activeInst.name}</h3>
                <p className="text-[11px] text-slate-300">AICTE Permanent ID: {activeInst.code} • {activeInst.type}</p>
              </div>
              <button onClick={() => setActiveInst(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs grid grid-cols-2 gap-2 text-slate-600">
              <div><strong>Address:</strong> {activeInst.address}</div>
              <div><strong>Email:</strong> {activeInst.email}</div>
              <div><strong>Phone:</strong> {activeInst.phone}</div>
              <div><strong>Secured Total:</strong> ₹{(activeInst.totalValue / 100000).toFixed(2)} Lakhs</div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Security Deposits ({activeInst.records?.length || 0})
              </h4>

              {(!activeInst.records || activeInst.records.length === 0) ? (
                <div className="text-xs text-slate-500 text-center py-6">
                  No active security deposits registered for this college yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {activeInst.records.map(f => (
                    <div key={f.id} className="p-3 text-xs flex items-center justify-between bg-white hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{f.fdrNumber}</span>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {f.bankName} • ₹{f.principalAmount.toLocaleString('en-IN')} • Matures: {f.maturityDate}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={f.status} size="sm" />
                        <Link
                          to={`/fdr/${f.id}`}
                          onClick={() => setActiveInst(null)}
                          className="text-teal-700 font-semibold hover:underline"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveInst(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

