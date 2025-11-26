interface HighValueUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  cartValue: number;
  cartItems: CartItem[];
  lastActivity: string;
  preferredServices: string[];
}

interface CartItem {
  id: string;
  serviceName: string;
  serviceType: string;
  price: number;
  quantity: number;
}

interface OutreachSuggestion {
  type: 'immediate_call' | 'personalized_email' | 'special_offer' | 'vip_service';
  priority: 'high' | 'medium' | 'low';
  message: string;
  reasoning: string;
}

interface HighValueAlert {
  id: string;
  userId: string;
  user: HighValueUser;
  cartValue: number;
  threshold: number;
  flaggedAt: string;
  status: 'new' | 'contacted' | 'converted' | 'dismissed';
  suggestions: OutreachSuggestion[];
}

export class HighValueAlertService {
  private static readonly DEFAULT_THRESHOLD = 5000;
  private static readonly PREMIUM_THRESHOLD = 10000;

  /**
   * Check if a user should be flagged as high-value based on cart value
   */
  static shouldFlagUser(cartValue: number, threshold: number = this.DEFAULT_THRESHOLD): boolean {
    return cartValue >= threshold;
  }

  /**
   * Generate personalized outreach suggestions based on user data
   */
  static generateOutreachSuggestions(user: HighValueUser): OutreachSuggestion[] {
    const suggestions: OutreachSuggestion[] = [];
    const { cartValue, cartItems, preferredServices } = user;

    // Immediate call for very high value carts
    if (cartValue >= this.PREMIUM_THRESHOLD) {
      suggestions.push({
        type: 'immediate_call',
        priority: 'high',
        message: `Call ${user.fullName} immediately to discuss their ₹${cartValue.toLocaleString('en-IN')} cart`,
        reasoning: `Cart value exceeds ₹${this.PREMIUM_THRESHOLD.toLocaleString('en-IN')}. Personal attention can increase conversion rate by 60%.`,
      });
    }

    // Personalized email for high-value users
    if (cartValue >= this.DEFAULT_THRESHOLD) {
      const serviceTypes = [...new Set(cartItems.map(item => item.serviceType))];
      suggestions.push({
        type: 'personalized_email',
        priority: cartValue >= this.PREMIUM_THRESHOLD ? 'high' : 'medium',
        message: `Send personalized email highlighting benefits of ${serviceTypes.join(', ')} services`,
        reasoning: `User has shown interest in multiple service types. Personalized communication can address specific needs.`,
      });
    }

    // Special offer for cart abandonment
    const lastActivityDate = new Date(user.lastActivity);
    const hoursSinceActivity = (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceActivity > 24) {
      suggestions.push({
        type: 'special_offer',
        priority: 'medium',
        message: `Offer 10-15% discount to encourage immediate booking`,
        reasoning: `Cart abandoned for ${Math.floor(hoursSinceActivity)} hours. Time-limited discount can create urgency.`,
      });
    }

    // VIP service for premium users
    if (cartValue >= this.PREMIUM_THRESHOLD) {
      suggestions.push({
        type: 'vip_service',
        priority: 'high',
        message: `Offer VIP service package with dedicated priest and premium Aashirwad Box`,
        reasoning: `High cart value indicates willingness to pay for premium experience. VIP package can increase satisfaction and loyalty.`,
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Create a high-value alert for a user
   */
  static async createAlert(user: HighValueUser, threshold: number = this.DEFAULT_THRESHOLD): Promise<HighValueAlert> {
    if (!this.shouldFlagUser(user.cartValue, threshold)) {
      throw new Error(`User cart value (₹${user.cartValue}) is below threshold (₹${threshold})`);
    }

    const alert: HighValueAlert = {
      id: `alert_${Date.now()}_${user.id}`,
      userId: user.id,
      user,
      cartValue: user.cartValue,
      threshold,
      flaggedAt: new Date().toISOString(),
      status: 'new',
      suggestions: this.generateOutreachSuggestions(user),
    };

    // TODO: Save to database
    // await supabase.from('high_value_alerts').insert(alert);

    // TODO: Send notification to administrators
    // await this.notifyAdministrators(alert);

    return alert;
  }

  /**
   * Get all active high-value alerts
   */
  static async getActiveAlerts(): Promise<HighValueAlert[]> {
    // TODO: Fetch from database
    // const { data } = await supabase
    //   .from('high_value_alerts')
    //   .select('*')
    //   .in('status', ['new', 'contacted'])
    //   .order('flaggedAt', { ascending: false });

    // Mock data for now
    return [];
  }

  /**
   * Update alert status
   */
  static async updateAlertStatus(
    alertId: string,
    status: HighValueAlert['status'],
    notes?: string
  ): Promise<void> {
    // TODO: Update in database
    // await supabase
    //   .from('high_value_alerts')
    //   .update({ status, notes, updatedAt: new Date().toISOString() })
    //   .eq('id', alertId);
  }

  /**
   * Get alert statistics
   */
  static async getAlertStatistics(): Promise<{
    totalAlerts: number;
    newAlerts: number;
    contactedAlerts: number;
    convertedAlerts: number;
    conversionRate: number;
    averageCartValue: number;
  }> {
    // TODO: Calculate from database
    // const { data } = await supabase
    //   .from('high_value_alerts')
    //   .select('status, cartValue');

    // Mock data for now
    return {
      totalAlerts: 0,
      newAlerts: 0,
      contactedAlerts: 0,
      convertedAlerts: 0,
      conversionRate: 0,
      averageCartValue: 0,
    };
  }

  /**
   * Automatically scan for high-value users and create alerts
   * This should be run periodically (e.g., every 30 minutes)
   */
  static async scanAndFlagHighValueUsers(threshold: number = this.DEFAULT_THRESHOLD): Promise<HighValueAlert[]> {
    // TODO: Query users with high cart values
    // const { data: users } = await supabase
    //   .from('profiles')
    //   .select('*, cart_items(*)')
    //   .gte('cart_value', threshold)
    //   .is('high_value_alert_sent', false);

    const alerts: HighValueAlert[] = [];

    // TODO: Create alerts for each user
    // for (const user of users) {
    //   const alert = await this.createAlert(user, threshold);
    //   alerts.push(alert);
    // }

    return alerts;
  }

  /**
   * Send notification to administrators about new high-value alert
   */
  private static async notifyAdministrators(alert: HighValueAlert): Promise<void> {
    // TODO: Send email/SMS to administrators
    // await sendEmail({
    //   to: 'admin@mandirmitra.com',
    //   subject: `High-Value User Alert: ${alert.user.fullName}`,
    //   body: `
    //     A high-value user has been flagged:
    //     
    //     Name: ${alert.user.fullName}
    //     Cart Value: ₹${alert.cartValue.toLocaleString('en-IN')}
    //     Phone: ${alert.user.phone}
    //     
    //     Suggested Actions:
    //     ${alert.suggestions.map(s => `- ${s.message}`).join('\n')}
    //   `,
    // });

    // TODO: Send in-app notification
    // await supabase.from('notifications').insert({
    //   type: 'high_value_alert',
    //   title: 'High-Value User Detected',
    //   message: `${alert.user.fullName} has a cart value of ₹${alert.cartValue.toLocaleString('en-IN')}`,
    //   data: { alertId: alert.id },
    // });
  }
}
