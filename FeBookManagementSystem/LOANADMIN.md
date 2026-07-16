# UI/UX Specification & AI Prompt: Admin Loan Management Dashboard

This markdown file acts as a comprehensive design system document and engineering handoff. It contains a structured **master prompt** to feed directly into code generation systems (like v0.dev, Bolt.new, Lovable, or Claude Artifacts) or to hand off to frontend developers. It translates the mobile layout into a high-density desktop admin panel that is fully typed to the provided React/Axios API client.

---

## 1. Architecture & API Mapping

The target interface translates your mobile application design into a professional, two-panel desktop layout designed to maximize workflow speed for library administrators.

### API Connection Matrix
* **Active Requests Overview:** Uses `getLoanDetailsByPage(page, limit)` to retrieve `LoanDetailsByPageAdmin[]` and structural metadata (`meta`) for table-based rendering.
* **Detailed Record Inspection:** When a specific row or card is clicked, the application triggers `getLoanDetail(loanId)` to fetch a complete `LoanDetailDTO` including the list of items (`loanDetails: LoanDetails[]`).
* **Interactive Decisive Actions:**
  * **Approve entire loan:** Triggers `confirmLoan({ loanId, status: 'BORROWING' })`.
  * **Deny entire loan:** Triggers `confirmLoan({ loanId, status: 'REJECTED' })`.
  * **Barcode Scan / Quick Return:** Uses `returnBookByBarcode(barcodes: string[])` to handle real-time drop-offs.

---

## 2. Copy-and-Paste Agent Generation Prompt

Copy the block below and paste it directly into your AI coding tool of choice to generate the functional page.

```markdown
Role: Principal React & Tailwind CSS Architect
Context: Build an "Admin Loan Management Dashboard" page using React, TypeScript, and Tailwind CSS.
Goal: Create a dual-panel, high-performance desktop master-detail interface matching the library service file design. The visual language must mimic the light-themed, professional aesthetic of the mobile UI with clean rounded shapes, soft backgrounds, and distinct indicator tags.

---

### Part 1: Technical Type Alignments
Ensure your local data states conform strictly to these interfaces:

```typescript
export interface ConfirmLoanRequest {
  loanId: string;
  status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
}

export interface LoanDetailDTO {
  loanId: string;
  borrowDate: string;
  dueDate: string;
  status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
  loanDetails: LoanDetails[];
}

export interface LoanDetails {
  loanDetailId: string;
  returnDate: string;
  status: 'PENDING' | 'REJECTED' | 'BORROWING' | 'RETURNED' | 'OVERDUE';
  copyBookId: string;
  url: string;
  bookId: string;
  bookName: string;
  barcode: string;
}
```

---

### Part 2: Layout & Interactive Design Specification

#### A. Sidebar Navigation (Left-aligned, 16% width)
- Include minimalist navigation links with icons:
  * "Tổng quan" (Dashboard)
  * "Sách" (Books)
  * "Người dùng" (Users)
  * "Yêu cầu mượn" (Loan Requests - ACTIVE tab)
  * "Cài đặt" (Settings)

#### B. Primary Panel: Master Loan List Table (54% width)
- **Top Metrics Row:** Include quick-action status badges directly mimicking the mobile UI:
  - "Tất cả" (Default badge)
  - "Chờ duyệt" (Yellow label, showing count of pending requests)
  - "Quá hạn" (Red label, showing count of overdue alerts)
- **Search Command Bar:** An input saying "Tìm sách, người mượn, mã thẻ..." with a magnifying glass icon.
- **Paginated Master Table:**
  - Standard columns: Checkbox, Borrower info (User photo avatar, Full Name, Card ID such as `LIB-2020-xxxx`), Borrow Date, Due Date, Status (Pending, Overdue, Borrowing, Returned), and Actions.
  - Hover states: Highlight row, clicking any row triggers a mock `getLoanDetail(loanId)` call to load the sub-items into the detail panel.
  - Footer: Clean pagination interface showing total counts, pages, next/prev arrows mapped directly to a pagination state.

#### C. Secondary Panel: Slide-over/Fixed Detail Inspector (30% width)
- **State Handling:** Show a clean default empty-state placeholder: "Chọn một yêu cầu để xem danh sách sách đăng ký mượn chi tiết" (Select a request to view detailed registered books).
- **Active Selection Header:** Displays `#LOAN-ID`, full name of the member, and their card status.
- **Embedded Lists (`loanDetails` array):**
  - Iterates through individual books inside that loan request.
  - Each item displays:
    * Thumbnail preview (`url`) of the book cover.
    * Book Name (`bookName`) & ID (`copyBookId`).
    * Scan Barcode (`barcode`) value.
    * Status Badge representing the individual physical item status (`PENDING`, `OVERDUE`, etc.).
- **Immediate Decisions Footer (Floating/Sticky at panel bottom):**
  - **"Từ chối" (Reject Request Button):** Standard border, warning label coloring, initiates `confirmLoan(id, 'REJECTED')`.
  - **"Duyệt yêu cầu" (Approve Request Button):** Strong solid emerald green theme, initiates `confirmLoan(id, 'BORROWING')`.
- **Active Scanning Utility:**
  - Include an immediate text bar: "Nhập hoặc Quét Barcode trả sách nhanh" allowing admins to handle physical book check-ins on-the-spot utilizing `returnBookByBarcode([barcode])`.

---

### Part 3: Color Palette & Visual Style Guide
- **Backgrounds:** Light warm/neutral canvas (`#fafafa` or `#f8fafc`). Panel cards should use sharp white backgrounds with subtle drop shadows (`shadow-sm`) and modern rounded corners (`rounded-xl` or `rounded-2xl`).
- **Accent Theme colors:**
  * Neutral: `#1f2937` (Charcoal Slate for main texts).
  * Safe State/Approve: `#10b981` (Emerald Green) & `#e6f4ea` (Soft Mint alert text background).
  * Pending: `#f59e0b` (Amber Orange) & `#fef3c7` (Soft Yellow alert text background).
  * Overdue Warning: `#ef4444` (Ruby Red) & `#fee2e2` (Soft Pink alert text background).
```

---

## 3. UI Structural Map

Below is a visual diagram of the component interface layouts for visual placement alignment:

```text
+-------------------------------------------------------------------------------------------------------------+
| SIDEBAR     |  YÊU CẦU MƯỢN (Loan Requests Overview)                                           [👤 Admin]   |
|             |  [ Tất cả ] [ Chờ duyệt (5) 🟡 ] [ Quá hạn (3) 🔴 ]            [ Tìm sách, người mượn...  🔎 ] |
| - Tổng quan |                                                                                               |
| - Sách      |  +------------------------------------------------------+ +---------------------------------+ |
| > Yêu cầu   |  | [ ] NGƯỜI MƯỢN         NGÀY YÊU CẦU   HẠN TRẢ  TRẠNG | | CHI TIẾT YÊU CẦU #L-9842        | |
| - Thành viên|  |------------------------------------------------------| | Thành viên: Nguyễn Văn An       | |
| - Cài đặt   |  | [ ] Nguyen Van An      30/06/2026   15/07/2026 [Chờ] | | Mã số thẻ: LIB-2020-0042        | |
|             |  | [x] Trần Thị Bích      29/06/2026   10/06/2026 [Trễ] | |---------------------------------| |
|             |  | [ ] Lê Minh Cường      29/06/2026   15/07/2026 [Chờ] | | SÁCH ĐĂNG KÝ (2 cuốn)           | |
|             |  | [ ] Phạm Thu Dung      28/06/2026   10/06/2026 [Trễ] | | [📘] Dune                       | |
|             |  |                                                      | |      Barcode: BC-9942  [Chờ]    | |
|             |  |                                                      | | [📘] Sapiens                  | |
|             |  +------------------------------------------------------+ |      Barcode: BC-9943  [Chờ]    | |
|             |  |   ◀  Trang 1 / 5  ▶                 [ Đã Chọn: 1 ]   | |---------------------------------| |
|             |  +------------------------------------------------------+ | [ Từ Chối ]    [ Duyệt Yêu Cầu ]| |
|             |                                                         +---------------------------------+ |
+-------------------------------------------------------------------------------------------------------------+
```
