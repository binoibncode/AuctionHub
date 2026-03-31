import React, { useState, useEffect } from 'react';
import { X, Camera, FileText } from 'lucide-react';
import { Player } from '../../types';
import { compressImage } from '../../utils/image';

interface EditPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onSave: (updatedPlayer: Player) => void;
}

export default function EditPlayerModal({ isOpen, onClose, player, onSave }: EditPlayerModalProps) {
  const [formData, setFormData] = useState<Player | null>(null);

  useEffect(() => {
    if (player && isOpen) {
      setFormData({ ...player });
    } else {
      setFormData(null);
    }
  }, [player, isOpen]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? {
      ...prev,
      [name]: name === 'age' || name === 'soldPrice' ? Number(value) : value
    } : null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photoUrl' | 'secondReferenceUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB');
      return;
    }
    try {
      const compressedDataUrl = await compressImage(file, 800, 0.7);
      setFormData(prev => prev ? { ...prev, [field]: compressedDataUrl } : null);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-dark-900/90 backdrop-blur-sm animate-fadeIn">
      <div className="bg-dark-800 rounded-xl w-full max-w-4xl shadow-2xl border border-dark-700 flex flex-col max-h-[90vh] animate-slideUp">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-dark-700">
          <h2 className="text-2xl font-black text-white">Edit Player Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-700 transition-colors text-dark-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <form id="edit-player-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photos Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-dark-700/30 p-6 rounded-xl border border-dark-700">
              {/* Profile Photo */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">Profile Photo</label>
                <label className="cursor-pointer group relative">
                  <div className="w-32 h-32 rounded-full bg-dark-800 border-2 border-dashed border-dark-500 group-hover:border-primary-500 flex items-center justify-center overflow-hidden transition-colors">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-dark-500 group-hover:text-primary-500 mx-auto transition-colors" />
                        <span className="text-xs text-dark-500 mt-2 block font-medium">Upload<br/>Photo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'photoUrl')} className="hidden" />
                </label>
                {formData.photoUrl && (
                  <button type="button" onClick={() => setFormData(prev => prev ? { ...prev, photoUrl: undefined } : null)} className="text-xs text-red-500 mt-2 font-bold hover:text-red-400">
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Second Reference */}
              <div className="flex flex-col items-center">
                <label className="block text-sm font-bold text-white mb-3 tracking-wide uppercase">Second Ref. (ID/Doc)</label>
                <label className="cursor-pointer group relative">
                  <div className="w-32 h-32 border-2 border-dashed border-dark-500 group-hover:border-blue-500 bg-dark-800 rounded-lg flex items-center justify-center overflow-hidden transition-colors">
                    {formData.secondReferenceUrl ? (
                      <img src={formData.secondReferenceUrl} alt="Reference" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="w-8 h-8 text-dark-500 group-hover:text-blue-500 mx-auto transition-colors" />
                        <span className="text-xs text-dark-500 mt-2 block font-medium">Upload<br/>Image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'secondReferenceUrl')} className="hidden" />
                </label>
                 {formData.secondReferenceUrl && (
                  <button type="button" onClick={() => setFormData(prev => prev ? { ...prev, secondReferenceUrl: undefined } : null)} className="text-xs text-red-500 mt-2 font-bold hover:text-red-400">
                    Remove Reference
                  </button>
                )}
              </div>
            </div>

            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Player Name</label>
                <input type="text" name="name" required className="input-field" value={formData.name || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Sold Price (Points)</label>
                <input type="number" name="soldPrice" className="input-field" value={formData.soldPrice || 0} onChange={handleInputChange} disabled={formData.status !== 'sold' && formData.status !== 'retained'} />
                {formData.status !== 'sold' && formData.status !== 'retained' && <p className="text-[10px] text-dark-500 mt-1">Player is not sold/retained yet.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Age</label>
                <input type="number" name="age" className="input-field" value={formData.age || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Father's Name</label>
                <input type="text" name="fatherName" className="input-field" value={formData.fatherName || ''} onChange={handleInputChange} />
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-dark-700 pt-5">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Player Tag (Type)</label>
                <select name="playerTag" className="input-field" value={formData.playerTag || 'Player'} onChange={handleInputChange}>
                  <option value="Player">Player</option>
                  <option value="Owner">Owner</option>
                  <option value="Captain">Captain</option>
                  <option value="Vice Captain">Vice Captain</option>
                  <option value="Icon">Icon</option>
                  <option value="Retain">Retain</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Role / Category</label>
                <select name="role" className="input-field" value={formData.role || 'Batsman'} onChange={handleInputChange}>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All Rounder">All Rounder</option>
                  <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Specification</label>
                <select name="specification" className="input-field" value={formData.specification || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All Rounder">All Rounder</option>
                  <option value="All Rounder WK">All Rounder WK</option>
                  <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Skill</label>
                <select name="skill" className="input-field" value={formData.skill || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  <option value="Right Arm Fast">Right Arm Fast</option>
                  <option value="Right Arm Medium">Right Arm Medium</option>
                  <option value="Left Arm Medium">Left Arm Medium</option>
                  <option value="Off-Break">Off-Break</option>
                  <option value="Leg-Break">Leg-Break</option>
                  <option value="Left Arm Orthdox">Left Arm Orthdox</option>
                  <option value="Left Arm Chinaman">Left Arm Chinaman</option>
                </select>
              </div>
            </div>

            {/* Gear & Status */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 border-t border-dark-700 pt-5">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Name</label>
                <input type="text" name="jerseyName" className="input-field" value={formData.jerseyName || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Jersey No.</label>
                <input type="text" name="jerseyNumber" className="input-field" value={formData.jerseyNumber || ''} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Jersey Size</label>
                <select name="jerseySize" className="input-field" value={formData.jerseySize || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  {['S','M','L','XL','XXL','Custom'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Trouser Size</label>
                <select name="trouserSize" className="input-field" value={formData.trouserSize || ''} onChange={handleInputChange}>
                  <option value="">-- None --</option>
                  {['S','M','L','XL','XXL','Custom'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="md:col-span-3 lg:col-span-5 pt-2">
                <label className="block text-sm font-medium text-dark-400 mb-1">Status</label>
                <select name="status" className="input-field max-w-xs" value={formData.status} onChange={handleInputChange}>
                  <option value="available">Available (Unsold)</option>
                  <option value="sold">Sold</option>
                  <option value="retained">Retained (Icon/Owner)</option>
                </select>
              </div>
            </div>
            
            <div className="border-t border-dark-700 pt-5">
              <label className="block text-sm font-medium text-dark-400 mb-1">Extra Details / Medical</label>
              <textarea name="extraDetails" className="input-field min-h-[80px] resize-y" value={formData.extraDetails || ''} onChange={handleInputChange} />
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-dark-900 border-t border-dark-700 flex justify-end gap-3 rounded-b-xl border-t-2">
          <button type="button" onClick={onClose} className="btn-secondary py-2 px-6">Cancel</button>
          <button type="submit" form="edit-player-form" className="btn-primary py-2 px-8 font-bold">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
