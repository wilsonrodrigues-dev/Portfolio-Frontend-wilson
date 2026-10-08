import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Sparkles, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import { LoadingState, ErrorState, EmptyState } from '../../components/admin/AdminStates';
import Notice from '../../components/admin/Notice';
import type { NoticeState } from '../../components/admin/Notice';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { FormField } from '../../components/admin/FormField';
import { fieldClass, primaryButtonClass, secondaryButtonClass } from '../../components/admin/formStyles';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Skill {
  _id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  icon: string;
  order: number;
  visible: boolean;
}

interface SkillForm {
  name: string;
  category: string;
  level: Skill['level'];
  icon: string;
  order: string;
  visible: boolean;
}

const LEVEL_OPTIONS: Skill['level'][] = ['beginner', 'intermediate', 'advanced', 'expert'];

const LEVEL_COLORS: Record<Skill['level'], string> = {
  beginner: 'bg-gray-500/20 text-gray-300',
  intermediate: 'bg-blue-500/20 text-blue-300',
  advanced: 'bg-purple-500/20 text-purple-300',
  expert: 'bg-amber-500/20 text-amber-300',
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const EMPTY_FORM: SkillForm = {
  name: '',
  category: '',
  level: 'intermediate',
  icon: '',
  order: '0',
  visible: true,
};

function toForm(skill: Skill): SkillForm {
  return {
    name: skill.name,
    category: skill.category,
    level: skill.level,
    icon: skill.icon ?? '',
    order: String(skill.order),
    visible: skill.visible,
  };
}

function validateForm(form: SkillForm): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Skill name is required.';
  if (!form.category.trim()) errors.category = 'Category is required.';
  return errors;
}

/* ─── Modal ──────────────────────────────────────────────────────────────── */
function SkillModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Skill | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<SkillForm>(initial ? toForm(initial) : EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function update<K extends keyof SkillForm>(key: K, value: SkillForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    setSaveError(null);

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      level: form.level,
      icon: form.icon.trim(),
      order: Number(form.order) || 0,
      visible: form.visible,
    };

    try {
      if (isEdit) {
        await api.put(`/skills/${initial!._id}`, payload);
      } else {
        await api.post('/skills', payload);
      }
      onSaved();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, 'Failed to save skill.'));
    } finally {
      setSaving(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit skill' : 'Add skill'}
    >
      <div className="glass-panel w-full max-w-lg p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-color pb-4">
          <h2 className="font-display font-semibold text-lg">
            {isEdit ? 'Edit Skill' : 'Add Skill'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {saveError && (
          <Notice type="error" message={saveError} onClose={() => setSaveError(null)} />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Skill name" htmlFor="skill-name" required error={errors.name}>
              <input
                id="skill-name"
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                aria-invalid={!!errors.name}
                className={fieldClass(!!errors.name)}
                placeholder="e.g. TypeScript"
              />
            </FormField>

            <FormField label="Category" htmlFor="skill-category" required error={errors.category}>
              <input
                id="skill-category"
                type="text"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                aria-invalid={!!errors.category}
                className={fieldClass(!!errors.category)}
                placeholder="e.g. Frontend"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Level" htmlFor="skill-level">
              <select
                id="skill-level"
                value={form.level}
                onChange={(e) => update('level', e.target.value as Skill['level'])}
                className={fieldClass()}
              >
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l.charAt(0).toUpperCase() + l.slice(1)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Order" htmlFor="skill-order" hint="Lower = first">
              <input
                id="skill-order"
                type="number"
                min={0}
                step={1}
                value={form.order}
                onChange={(e) => update('order', e.target.value)}
                className={fieldClass()}
              />
            </FormField>
          </div>

          <FormField
            label="Icon"
            htmlFor="skill-icon"
            hint="Icon name (e.g. SiTypescript) or emoji"
          >
            <input
              id="skill-icon"
              type="text"
              value={form.icon}
              onChange={(e) => update('icon', e.target.value)}
              className={fieldClass()}
              placeholder="SiReact"
            />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => update('visible', e.target.checked)}
              className="w-4 h-4 accent-accent-primary"
            />
            Show on public portfolio
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-border-color">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={secondaryButtonClass()}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={primaryButtonClass()}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Skills grouped by category ─────────────────────────────────────────── */
function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || 'Uncategorised';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Skill | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/skills');
        if (res.data.success) {
          setSkills(res.data.data ?? []);
        } else {
          setError(res.data.message || 'Failed to load skills.');
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load skills.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reloadKey]);

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(skill: Skill) {
    setEditTarget(skill);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    setEditTarget(null);
    setNotice({ type: 'success', message: editTarget ? 'Skill updated.' : 'Skill added.' });
    setReloadKey((k) => k + 1);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/skills/${deleteTarget._id}`);
      setDeleteTarget(null);
      setNotice({ type: 'success', message: 'Skill deleted.' });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setNotice({ type: 'error', message: getApiErrorMessage(err, 'Failed to delete skill.') });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleVisibility(skill: Skill) {
    try {
      await api.put(`/skills/${skill._id}`, { visible: !skill.visible });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setNotice({ type: 'error', message: getApiErrorMessage(err, 'Failed to update visibility.') });
    }
  }

  const grouped = groupByCategory(skills);
  const categories = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold mb-1">Skills</h2>
          <p className="text-text-muted text-sm">
            Manage the skills shown on your public portfolio.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-text-primary hover:bg-text-secondary transition-colors text-sm font-medium text-bg-color"
        >
          <Plus size={16} /> Add Skill
        </button>
      </div>

      {/* Notice */}
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {/* Content */}
      {loading ? (
        <LoadingState label="Loading skills…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />
      ) : skills.length === 0 ? (
        <div className="glass-panel">
          <EmptyState
            icon={<Sparkles size={20} />}
            title="No skills yet"
            description="Add your first skill and it will appear on the public portfolio."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <section key={cat} className="glass-panel overflow-hidden">
              <div className="px-6 py-4 border-b border-border-color flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-text-secondary">
                  {cat}
                </h3>
                <span className="text-xs text-text-muted">{grouped[cat].length} skill{grouped[cat].length !== 1 ? 's' : ''}</span>
              </div>
              <ul>
                {grouped[cat].map((skill, idx) => (
                  <li
                    key={skill._id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-glass-bg ${
                      idx < grouped[cat].length - 1 ? 'border-b border-border-color' : ''
                    }`}
                  >
                    {/* Drag handle (visual only) */}
                    <GripVertical size={16} className="text-text-muted shrink-0" />

                    {/* Icon / emoji placeholder */}
                    <div className="w-9 h-9 rounded-md bg-glass-bg border border-border-color flex items-center justify-center text-xs font-mono text-text-secondary shrink-0 overflow-hidden">
                      {skill.icon ? (
                        <span title={skill.icon}>
                          {skill.icon.startsWith('Si') || skill.icon.startsWith('Fa') || skill.icon.startsWith('Bi')
                            ? skill.icon.replace(/^(Si|Fa|Bi)/, '').slice(0, 2)
                            : skill.icon.slice(0, 2)}
                        </span>
                      ) : (
                        '?'
                      )}
                    </div>

                    {/* Name + level */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${skill.visible ? 'text-text-primary' : 'text-text-muted'}`}>
                        {skill.name}
                      </p>
                    </div>

                    {/* Level badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[skill.level]}`}>
                      {skill.level}
                    </span>

                    {/* Order number */}
                    <span className="text-xs text-text-muted w-6 text-right shrink-0">
                      #{skill.order}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(skill)}
                        title={skill.visible ? 'Hide from public' : 'Show on public'}
                        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-glass-bg transition-colors"
                      >
                        {skill.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(skill)}
                        title="Edit"
                        className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-glass-bg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(skill)}
                        title="Delete"
                        className="p-1.5 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <SkillModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Skill"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
