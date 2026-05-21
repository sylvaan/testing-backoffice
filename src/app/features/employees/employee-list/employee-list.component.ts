import { Component, OnInit } from '@angular/core';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  pagedEmployees: Employee[] = [];
  groups: string[] = [];

  searchTerm: string = '';
  selectedGroup: string | null = null;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private employeeService: EmployeeService) { }

  ngOnInit(): void {
    const state = this.employeeService.getSearchState();
    this.searchTerm = state.searchTerm;
    this.selectedGroup = state.selectedGroup;
    this.currentPage = state.currentPage;
    this.pageSize = state.pageSize;
    this.groups = this.employeeService.getGroups();
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
      this.applyFilterAndPagination();
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterAndPagination();
    }
  }

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilterAndPagination();
  }

  applyFilterAndPagination(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const group = this.selectedGroup;
    this.filteredEmployees = this.employees.filter((emp) => {
      const matchesText = !term || (
        emp.firstName.toLowerCase().includes(term) ||
        emp.lastName.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        emp.username.toLowerCase().includes(term)
      );

      const matchesGroup = !group || emp.group === group;

      return matchesText && matchesGroup;
    });
    this.filteredEmployees.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (this.sortColumn === 'name') {
        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (this.sortColumn === 'email') {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (this.sortColumn === 'group') {
        valA = a.group.toLowerCase();
        valB = b.group.toLowerCase();
      } else if (this.sortColumn === 'status') {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      }

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    this.totalPages = Math.ceil(this.filteredEmployees.length / this.pageSize) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedEmployees = this.filteredEmployees.slice(startIndex, endIndex);

    this.employeeService.setSearchState({
      searchTerm: this.searchTerm,
      selectedGroup: this.selectedGroup,
      currentPage: this.currentPage,
      pageSize: this.pageSize
    });
  }

  getStartIndex(): number {
    return this.filteredEmployees.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.filteredEmployees.length ? this.filteredEmployees.length : end;
  }

  onEdit(emp: Employee): void {
    Swal.fire({
      title: 'Aksi Edit Dipicu',
      text: `Menampilkan notifikasi kuning untuk aksi edit pegawai ${emp.firstName} ${emp.lastName}`,
      icon: 'warning',
      confirmButtonColor: '#ffa800',
      confirmButtonText: 'Selesai',
      heightAuto: false
    });
  }

  onDelete(emp: Employee): void {
    Swal.fire({
      title: 'Hapus Pegawai?',
      text: `Apakah Anda yakin ingin menghapus data ${emp.firstName} ${emp.lastName}?`,
      icon: 'error',
      iconColor: '#f64e60',
      showCancelButton: true,
      confirmButtonColor: '#f64e60',
      cancelButtonColor: '#e4e6ef',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      heightAuto: false
    }).then((result) => {
      if (result.isConfirmed) {
         this.employeeService.deleteEmployee(emp.id);
         Swal.fire({
           toast: true,
           position: 'top-end',
           icon: 'success',
           title: 'Pegawai berhasil dihapus!',
           showConfirmButton: false,
           timer: 1500,
           timerProgressBar: true
         });
         this.loadEmployees();
      }
    });
  }
}
