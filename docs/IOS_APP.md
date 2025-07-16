# iOS App Development Guide

## Overview

The iOS app will be Lucia's main tool for managing her tattoo scheduling system. It needs three core screens and should integrate seamlessly with the backend API.

## Technology Stack

- **Swift 5.0+**
- **SwiftUI** for UI
- **Combine** for reactive programming
- **URLSession** for API calls
- **UserNotifications** for push notifications
- **iOS 14.0+** minimum deployment target

## Project Structure

```
LuciddaScheduler/
├── LuciddaScheduler/
│   ├── App/
│   │   ├── LuciddaSchedulerApp.swift
│   │   └── ContentView.swift
│   ├── Views/
│   │   ├── Login/
│   │   │   └── LoginView.swift
│   │   ├── WorkingHours/
│   │   │   ├── WorkingHoursView.swift
│   │   │   └── DayScheduleRow.swift
│   │   ├── NewAppointment/
│   │   │   ├── NewAppointmentView.swift
│   │   │   └── BookingLinkSheet.swift
│   │   └── Calendar/
│   │       ├── CalendarView.swift
│   │       └── AppointmentRow.swift
│   ├── Models/
│   │   ├── User.swift
│   │   ├── WorkingHours.swift
│   │   ├── Appointment.swift
│   │   └── BookingLink.swift
│   ├── Services/
│   │   ├── APIService.swift
│   │   ├── AuthService.swift
│   │   └── NotificationService.swift
│   └── Utils/
│       ├── Constants.swift
│       └── Extensions.swift
└── LuciddaScheduler.xcodeproj
```

## Key Features Implementation

### 1. Authentication & Setup

```swift
// AuthService.swift
import Foundation
import Combine

class AuthService: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let apiService: APIService
    
    init(apiService: APIService) {
        self.apiService = apiService
        checkAuthStatus()
    }
    
    func login(email: String, password: String) -> AnyPublisher<User, Error> {
        let loginData = LoginRequest(email: email, password: password)
        
        return apiService.post("/auth/login", body: loginData)
            .map { (response: LoginResponse) in
                self.storeAuthToken(response.token)
                self.currentUser = response.user
                self.isAuthenticated = true
                return response.user
            }
            .eraseToAnyPublisher()
    }
    
    private func storeAuthToken(_ token: String) {
        UserDefaults.standard.set(token, forKey: "auth_token")
    }
}
```

### 2. Working Hours Management

```swift
// WorkingHoursView.swift
import SwiftUI

struct WorkingHoursView: View {
    @StateObject private var viewModel = WorkingHoursViewModel()
    
    var body: some View {
        NavigationView {
            List {
                ForEach(DayOfWeek.allCases, id: \.self) { day in
                    DayScheduleRow(
                        day: day,
                        schedules: viewModel.workingHours.filter { $0.dayOfWeek == day.rawValue },
                        onAdd: { viewModel.addSchedule(for: day) },
                        onDelete: { viewModel.deleteSchedule($0) }
                    )
                }
                
                Section("Excepciones") {
                    ForEach(viewModel.overrides, id: \.id) { override in
                        OverrideRow(override: override) {
                            viewModel.deleteOverride(override)
                        }
                    }
                    
                    Button("Agregar Excepción") {
                        viewModel.showingAddOverride = true
                    }
                }
            }
            .navigationTitle("Horarios")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Guardar") {
                        viewModel.saveWorkingHours()
                    }
                    .disabled(!viewModel.hasChanges)
                }
            }
            .sheet(isPresented: $viewModel.showingAddOverride) {
                AddOverrideSheet(onSave: viewModel.addOverride)
            }
        }
        .onAppear {
            viewModel.loadWorkingHours()
        }
    }
}
```

### 3. New Appointment Creation

```swift
// NewAppointmentView.swift
import SwiftUI

struct NewAppointmentView: View {
    @StateObject private var viewModel = NewAppointmentViewModel()
    @State private var tattooDescription = ""
    @State private var duration = 120 // minutes
    @State private var showingBookingLink = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Detalles del Tatuaje") {
                    TextField("Descripción", text: $tattooDescription, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                Section("Duración") {
                    Picker("Duración", selection: $duration) {
                        ForEach([30, 60, 90, 120, 180, 240, 300, 360, 420, 480], id: \.self) { minutes in
                            Text("\(minutes / 60)h \(minutes % 60)m")
                                .tag(minutes)
                        }
                    }
                    .pickerStyle(.wheel)
                }
                
                Section {
                    Button("Generar Link de Reserva") {
                        viewModel.createBookingLink(
                            description: tattooDescription,
                            duration: duration
                        )
                    }
                    .disabled(tattooDescription.isEmpty)
                }
            }
            .navigationTitle("Nueva Cita")
            .alert("Link Generado", isPresented: $viewModel.showingSuccess) {
                Button("Copiar Link") {
                    UIPasteboard.general.string = viewModel.bookingURL
                }
                Button("Compartir") {
                    shareBookingLink()
                }
                Button("OK") { }
            } message: {
                Text("El link de reserva ha sido generado exitosamente.")
            }
        }
    }
    
    private func shareBookingLink() {
        guard let url = URL(string: viewModel.bookingURL) else { return }
        
        let activityController = UIActivityViewController(
            activityItems: [url],
            applicationActivities: nil
        )
        
        // Present activity controller
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first {
            window.rootViewController?.present(activityController, animated: true)
        }
    }
}
```

### 4. Calendar View

```swift
// CalendarView.swift
import SwiftUI

struct CalendarView: View {
    @StateObject private var viewModel = CalendarViewModel()
    
    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.groupedAppointments.keys.sorted(), id: \.self) { date in
                    Section(header: Text(date.formatted(date: .complete, time: .omitted))) {
                        ForEach(viewModel.groupedAppointments[date] ?? [], id: \.id) { appointment in
                            AppointmentRow(appointment: appointment) {
                                viewModel.cancelAppointment(appointment)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Próximas Citas")
            .refreshable {
                await viewModel.loadAppointments()
            }
            .task {
                await viewModel.loadAppointments()
            }
        }
    }
}

struct AppointmentRow: View {
    let appointment: Appointment
    let onCancel: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(appointment.clientName)
                    .font(.headline)
                Spacer()
                Text("\(appointment.startTime) - \(appointment.endTime)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(appointment.tattooDescription)
                .font(.body)
                .lineLimit(2)
            
            HStack {
                Text(appointment.clientEmail)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(appointment.durationMinutes / 60)h \(appointment.durationMinutes % 60)m")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("Cancelar", role: .destructive) {
                onCancel()
            }
        }
    }
}
```

### 5. API Service

```swift
// APIService.swift
import Foundation
import Combine

class APIService {
    private let baseURL = "https://api.lucidda.tattoo/api"
    private let session = URLSession.shared
    
    func get<T: Codable>(_ endpoint: String) -> AnyPublisher<T, Error> {
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.addAuthHeader()
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: T.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
    
    func post<T: Codable, U: Codable>(_ endpoint: String, body: T) -> AnyPublisher<U, Error> {
        guard let url = URL(string: baseURL + endpoint) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addAuthHeader()
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            return Fail(error: error)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: U.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .eraseToAnyPublisher()
    }
}

extension URLRequest {
    mutating func addAuthHeader() {
        if let token = UserDefaults.standard.string(forKey: "auth_token") {
            setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
    }
}
```

### 6. Push Notifications

```swift
// NotificationService.swift
import UserNotifications
import UIKit

class NotificationService: NSObject, ObservableObject {
    
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }
    
    func registerPushToken(_ token: Data) {
        let tokenString = token.map { String(format: "%02.2hhx", $0) }.joined()
        
        // Send token to backend
        APIService().post("/auth/push-token", body: ["pushToken": tokenString])
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { (_: EmptyResponse) in
                    print("Push token registered successfully")
                }
            )
            .store(in: &cancellables)
    }
    
    private var cancellables = Set<AnyCancellable>()
}
```

## Data Models

```swift
// Models/User.swift
struct User: Codable {
    let id: Int
    let email: String
    let name: String
    let role: String
    let timezone: String
}

// Models/Appointment.swift
struct Appointment: Codable, Identifiable {
    let id: Int
    let clientName: String
    let clientEmail: String
    let clientDni: String
    let tattooDescription: String
    let appointmentDate: String
    let startTime: String
    let endTime: String
    let durationMinutes: Int
    let status: String
    let createdAt: String
}

// Models/WorkingHours.swift
struct WorkingHours: Codable, Identifiable {
    let id: Int
    let dayOfWeek: Int
    let startTime: String
    let endTime: String
    let isActive: Bool
}

// Models/BookingLink.swift
struct BookingLink: Codable {
    let id: Int
    let token: String
    let bookingUrl: String
    let expiresAt: String
}
```

## App Configuration

### Info.plist additions:

```xml
<key>NSCameraUsageDescription</key>
<string>Para tomar fotos de referencias de tatuajes</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Para seleccionar imágenes de referencia</string>

<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

## Development Timeline

### Phase 1 (Week 1-2): Core Structure
- [ ] Project setup and navigation
- [ ] Authentication flow
- [ ] Basic UI components
- [ ] API service integration

### Phase 2 (Week 3-4): Main Features
- [ ] Working hours management
- [ ] New appointment creation
- [ ] Calendar view with appointments
- [ ] Push notifications setup

### Phase 3 (Week 5-6): Polish & Testing
- [ ] Error handling and loading states
- [ ] Offline support (basic)
- [ ] App Store preparation
- [ ] Testing and bug fixes

## App Store Submission

### Requirements:
- Apple Developer Account ($99/year)
- App icons and screenshots
- Privacy policy
- App description in Spanish
- TestFlight beta testing

### App Store Connect Setup:
1. Create app bundle ID: `com.lucidda.scheduler`
2. Configure app metadata
3. Upload build via Xcode
4. Submit for review

## Estimated Development Time

- **Experienced iOS Developer**: 4-6 weeks
- **Intermediate Developer**: 6-8 weeks
- **Learning Swift/iOS**: 10-12 weeks

## Cost Estimates

- **iOS Developer (Freelance)**: $3,000-$8,000
- **Development Agency**: $8,000-$15,000
- **Apple Developer Account**: $99/year
- **App Store fees**: 30% of any paid features (none planned)

This iOS app will give Lucia complete control over her scheduling system while maintaining a professional, easy-to-use interface that matches her brand aesthetic.
