import React, { useState, useEffect } from "react";
import api from "../../services/api"; // your axios instance

const styles = {
  container: { padding: 20, fontFamily: "Inter, Roboto, Arial, sans-serif" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  controls: { display: "flex", gap: 12, alignItems: "center" },
  input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", minWidth: 220 },
  button: { padding: "8px 12px", borderRadius: 6, border: "none", cursor: "pointer" },
  addBtn: { background: "#0b74de", color: "white" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  th: { textAlign: "left", padding: 10, borderBottom: "1px solid #eee", background: "#fafafa" },
  td: { padding: 10, borderBottom: "1px solid #f4f4f4" },
  badge: { display: "inline-block", padding: "4px 8px", borderRadius: 999, fontSize: 12, marginLeft: 8 },
  loadMoreWrap: { display: "flex", justifyContent: "center", marginTop: 12 },
  modalBackdrop: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal: { background: "#fff", padding: 24, borderRadius: 8, minWidth: 320, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" },
  actionBtn: { padding: "6px 10px", borderRadius: 6, border: "none", cursor: "pointer" },
  dangerBtn: { background: "#ff6b6b", color: "#fff" },
  smallMuted: { fontSize: 13, color: "#666" },
};

const Users = () => {
  const [users, setUsers] = useState([]); // accumulated results
  const [nextUrl, setNextUrl] = useState(null);
  const [totalCount, setTotalCount] = useState(null);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "" });

  const [loading, setLoading] = useState(false); // initial fetch + submit + delete
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // initial fetch (first page)
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // request first page
      const res = await api.get("auth/users/");
      const data = res.data || {};
      setUsers(Array.isArray(data.results) ? data.results : []);
      setNextUrl(data.next || null);
      setTotalCount(data.count ?? null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // load next page and append
  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    setError("");
    try {
      // axios supports absolute URLs; use api.get(nextUrl)
      const res = await api.get(nextUrl);
      const data = res.data || {};
      const more = Array.isArray(data.results) ? data.results : [];
      setUsers((prev) => [...prev, ...more]);
      setNextUrl(data.next || null);
      setTotalCount(data.count ?? totalCount);
    } catch (err) {
      console.error(err);
      setError("Failed to load more users");
    } finally {
      setLoadingMore(false);
    }
  };

  // filtered view for search (client-side over loaded users)
  const filteredUsers = users.filter((u) =>
    [u.first_name, u.last_name, u.email]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  // modal handlers
  const openAddModal = () => {
    setEditUser(null);
    setForm({ first_name: "", last_name: "", email: "" });
    setModalOpen(true);
  };
  const openEditModal = (user) => {
    setEditUser(user);
    setForm({ first_name: user.first_name || "", last_name: user.last_name || "", email: user.email || "" });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // create / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (editUser) {
        await api.patch(`auth/users/${editUser.id}/`, form);
      } else {
        await api.post("auth/users/", form);
      }
      // re-fetch first page to keep source-of-truth accurate (resets pagination)
      await fetchUsers();
      closeModal();
    } catch (err) {
      console.error(err);
      setError("Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setLoading(true);
    setError("");
    try {
      await api.delete(`auth/users/${id}/`);
      // remove locally for immediate UX
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // optionally re-sync counts by refetching first page:
      // await fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // UI helpers
  const loadedCount = users.length;
  const allLoaded = totalCount !== null ? loadedCount >= totalCount : !nextUrl;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <div style={{ marginTop: 6 }}>
            <span style={styles.smallMuted}>
              {totalCount !== null ? `${loadedCount} of ${totalCount} loaded` : `${loadedCount} loaded`}
            </span>
          </div>
        </div>

        <div style={styles.controls}>
          <input
            style={styles.input}
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            style={{ ...styles.button, ...styles.addBtn }}
            onClick={openAddModal}
            aria-label="Add user"
          >
            ➕ Add User
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading && users.length === 0 ? (
        <div style={{ padding: 20 }}>Loading users…</div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Flags</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600 }}>{(user.first_name || "") + " " + (user.last_name || "") || "—"}</div>
                    <div style={styles.smallMuted}>ID: {user.id}</div>
                  </td>

                  <td style={styles.td}>
                    <div>{user.email}</div>
                    <div style={styles.smallMuted}>{user.is_superuser ? "Superuser" : user.is_staff ? "Staff" : ""}</div>
                  </td>

                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: user.is_email_verified ? "#e6ffed" : "#fff5f5", color: user.is_email_verified ? "#088c3a" : "#b02a37", border: "1px solid #eee" }}>
                      {user.is_email_verified ? "Verified" : "Unverified"}
                    </span>
                    {user.is_seller !== undefined && (
                      <span style={{ ...styles.badge, background: user.is_seller ? "#fff7e6" : "#f5f7ff", color: user.is_seller ? "#b06500" : "#27408b", border: "1px solid #eee" }}>
                        {user.is_seller ? "Seller" : "Buyer"}
                      </span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <button
                      onClick={() => openEditModal(user)}
                      style={{ ...styles.actionBtn, marginRight: 8, background: "#f4f6fb" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ ...styles.actionBtn, ...styles.dangerBtn }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={styles.loadMoreWrap}>
            {!allLoaded && (
              <button
                onClick={loadMore}
                disabled={!nextUrl || loadingMore}
                style={{ ...styles.button, background: "#0b74de", color: "#fff", borderRadius: 8, padding: "8px 14px" }}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}

            {allLoaded && (
              <div style={{ color: "#444", padding: 12 }}>
                All users loaded ({loadedCount})
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <form
            onSubmit={(e) => { e.stopPropagation(); handleSubmit(e); }}
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{editUser ? "Edit User" : "Add User"}</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 14 }}>First name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} required style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #e6e6e6" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 14 }}>Last name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} required style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #e6e6e6" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 14 }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: "100%", padding: 8, marginTop: 6, borderRadius: 6, border: "1px solid #e6e6e6" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={closeModal} style={{ ...styles.actionBtn, background: "#f4f6fb" }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} style={{ ...styles.actionBtn, background: "#0b74de", color: "#fff" }}>
                {loading ? (editUser ? "Updating…" : "Adding…") : editUser ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Users;
