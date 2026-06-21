import prisma from '../config/db';

export class GamificationService {
  /**
   * Add XP points to a user and check for levels and badge updates.
   */
  public static async awardXP(userId: string, xpAmount: number, actionName: string) {
    // 1. Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        actionName,
        xpEarned: xpAmount,
      },
    });

    // 2. Fetch current profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new Error('UserProfile not found');

    const newXP = profile.xpPoints + xpAmount;
    
    // Check if new badges are unlocked
    const earnedBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeName: true },
    });
    const earnedBadgeNames = new Set(earnedBadges.map((b) => b.badgeName));
    const newlyUnlockedBadges: string[] = [];

    // Milestone badges
    if (newXP > 0 && !earnedBadgeNames.has('Eco Beginner')) {
      newlyUnlockedBadges.push('Eco Beginner');
    }
    if (newXP >= 1000 && !earnedBadgeNames.has('Green Champion')) {
      newlyUnlockedBadges.push('Green Champion');
    }
    if (newXP >= 3000 && !earnedBadgeNames.has('Carbon Hero')) {
      newlyUnlockedBadges.push('Carbon Hero');
    }
    if (newXP >= 6000 && !earnedBadgeNames.has('Planet Protector')) {
      newlyUnlockedBadges.push('Planet Protector');
    }
    
    // Check for high sustainability score badge
    if (profile.sustainabilityScore >= 80 && !earnedBadgeNames.has('Sustainability Sage')) {
      newlyUnlockedBadges.push('Sustainability Sage');
    }

    // Award badges
    if (newlyUnlockedBadges.length > 0) {
      await prisma.userBadge.createMany({
        data: newlyUnlockedBadges.map((badgeName) => ({
          userId,
          badgeName,
        })),
      });
    }

    // Update profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        xpPoints: newXP,
        lastActiveDate: new Date(),
      },
    });

    return {
      xpPoints: updatedProfile.xpPoints,
      level: this.calculateLevel(updatedProfile.xpPoints),
      newlyUnlockedBadges,
    };
  }

  /**
   * Update the user's active streak.
   * Streaks increment if the user performs actions daily.
   */
  public static async updateStreak(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) return { streakDays: 0 };

    const now = new Date();
    const lastActive = new Date(profile.lastActiveDate);

    // Calculate difference in calendar days
    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = profile.streakDays;

    if (diffDays === 1) {
      // Completed action on the next consecutive day
      newStreak += 1;
    } else if (diffDays > 1) {
      // Missed a day, reset streak to 1
      newStreak = 1;
    } else if (profile.streakDays === 0) {
      // Initializing streak
      newStreak = 1;
    }

    // Check if user unlocks "Streak Star" badge
    if (newStreak >= 7) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeName: 'Streak Star' },
      });
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: { userId, badgeName: 'Streak Star' },
        });
      }
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        streakDays: newStreak,
        lastActiveDate: now,
      },
    });

    return {
      streakDays: updatedProfile.streakDays,
    };
  }

  public static calculateLevel(xp: number): number {
    // 500 XP required per level. Level 1 starts at 0 XP.
    return 1 + Math.floor(xp / 500);
  }
}
