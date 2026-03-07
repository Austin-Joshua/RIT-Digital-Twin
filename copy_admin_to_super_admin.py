import codecs

with codecs.open("frontend/src/pages/AdminDashboard.jsx", "r", "utf-8") as f:
    code = f.read()

code = code.replace("const AdminDashboard = () =>", "const SuperAdminDashboard = () =>")
code = code.replace("export default AdminDashboard", "export default SuperAdminDashboard")
code = code.replace("role=\"ADMIN\"", "role=\"SUPER_ADMIN\"")

with codecs.open("frontend/src/pages/SuperAdminDashboard.jsx", "w", "utf-8") as f:
    f.write(code)
