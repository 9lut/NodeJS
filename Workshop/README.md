# 📚 E-Commerce API Documentation

เอกสารฉบับนี้รวบรวม API Endpoints ทั้งหมดของระบบ พร้อมทั้งวิธีการเรียกใช้งานและสิทธิ์การเข้าถึง (Roles) ในแต่ละ Endpoint

---

## 🔒 Authentication (ระบบสมาชิกและเข้าสู่ระบบ)

### 1. สมัครสมาชิก

- **Endpoint:** `POST /api/v1/register`
- **Description:** ใช้สำหรับสมัครสมาชิกใหม่ หากสมัครเป็น `shop` บัญชีจะต้องรอ Admin อนุมัติ (isApproved: false)
- **Body (JSON):**
  ```json
  {
    "username": "testuser",
    "password": "password123",
    "role": "user" // "user", "shop", หรือ "admin"
  }
  ```

### 2. เข้าสู่ระบบ

- **Endpoint:** `POST /api/v1/login`
- **Description:** ใช้สำหรับเข้าสู่ระบบและรับ JWT Token (จำกัดการเข้าสู่ระบบ 5 ครั้ง / 1 นาที)
- **Body (JSON):**
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```
- **Response:** ส่งคืน `token` นำไปใช้แนบใน Header `Authorization: Bearer <token>` สำหรับเส้นอื่นๆ

---

## 👥 Users (จัดการผู้ใช้งาน)

### 3. ดึงรายชื่อผู้ใช้ทั้งหมด

- **Endpoint:** `GET /api/v1/users`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** `admin`

### 4. อนุมัติบัญชีผู้ใช้ (Approve)

- **Endpoint:** `PUT /api/v1/users/:id/approve`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** `admin`
- **Description:** ใช้สำหรับอนุมัติบัญชีที่มี role เป็น `shop` เพื่อให้สามารถเข้าสู่ระบบและใช้งานได้

---

## 📦 Products (จัดการสินค้า)

### 5. ดึงรายการสินค้าทั้งหมด (เฉพาะที่ Active)

- **Endpoint:** `GET /api/v1/products`
- **Role ที่เข้าถึงได้:** เข้าถึงได้ทุกคน (Public) แต่อาจมี Rate Limit 100 ครั้ง / 1 นาที

### 6. ดึงข้อมูลสินค้า 1 รายการ

- **Endpoint:** `GET /api/v1/products/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** ต้อง Login ก่อน

### 7. เพิ่มสินค้าใหม่

- **Endpoint:** `POST /api/v1/products`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** `shop` (เจ้าของร้าน) และ `admin`
- **Body (form-data):**
  - `name`: ชื่อสินค้า (Text)
  - `description`: รายละเอียด (Text)
  - `price`: ราคา (Number)
  - `stock`: จำนวนสต็อก (Number)
  - `image`: ไฟล์รูปภาพสินค้า (File)

### 8. แก้ไขข้อมูลสินค้า

- **Endpoint:** `PUT /api/v1/products/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** `shop` (เฉพาะเจ้าของสินค้านั้น) และ `admin`
- **Body (form-data):** ส่งเฉพาะข้อมูลที่ต้องการอัปเดต (`name`, `description`, `price`, `stock`, `image`)

### 9. ลบสินค้า (Soft Delete)

- **Endpoint:** `DELETE /api/v1/products/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** `shop` (เฉพาะเจ้าของสินค้านั้น) และ `admin`
- **Description:** จะเปลี่ยนสถานะสินค้าเป็น `isActive: false` ทำให้ไม่แสดงในหน้ารวมสินค้า

### 10. ดูรายการสั่งซื้อของสินค้านั้นๆ

- **Endpoint:** `GET /api/v1/products/:id/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** `shop` (เฉพาะเจ้าของสินค้านั้น) และ `admin`

### 11. สั่งซื้อสินค้า

- **Endpoint:** `POST /api/v1/products/:id/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:** ต้อง Login ก่อน (ผู้ใช้งานทั่วไป)
- **Description:** ทำการสั่งซื้อ, ลดจำนวน stock และคำนวณราคารวมให้อัตโนมัติ
- **Body (JSON):**
  ```json
  {
    "quantity": 2
  }
  ```

---

## 🛒 Orders (จัดการคำสั่งซื้อ)

### 12. ดึงรายการคำสั่งซื้อทั้งหมด

- **Endpoint:** `GET /api/v1/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Role ที่เข้าถึงได้:**
  - `admin` (ดูได้ทั้งหมด)
  - `shop` (ดูได้เฉพาะรายการสั่งซื้อของสินค้าในร้านตัวเอง)
- **Description:** คืนค่าข้อมูลคำสั่งซื้อแบบละเอียด รวมชื่อคนซื้อ ข้อมูลสินค้า ราคาสินค้า และราคารวม

---

## 🛠 วิธีการใช้งานทั่วไป

1. ผู้ใช้ต้อง **สมัครสมาชิก (`/register`)** ก่อน
2. หากสมัครเป็น **`shop`** ให้ใช้สิทธิ์ **`admin`** เรียกเส้น `/api/v1/users/:id/approve` เพื่ออนุมัติให้ใช้งานได้
3. **เข้าสู่ระบบ (`/login`)** เพื่อรับ Token
4. สำหรับ API ที่มีการล็อกสิทธิ์ จะต้องนำ Token มาแนบใน Header `Authorization: Bearer <YOUR_TOKEN>` เสมอ
