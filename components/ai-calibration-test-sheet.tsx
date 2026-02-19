import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { textStyles, statusBadgeStyles, confidenceStyles, riskColors } from '@/lib/design-system'

/**
 * AI CALIBRATION TEST SHEET
 * 
 * Purpose: Visual reference to test what AI vision models can accurately detect
 * 
 * How to use:
 * 1. Render this component
 * 2. Take a screenshot
 * 3. Upload to AI and ask: "Identify the font sizes, colors, padding, and components you see"
 * 4. Compare AI response to the documented values below
 * 5. Explicitly provide code for elements AI misidentifies
 * 
 * Expected AI accuracy:
 * - Component types: 95%+ (should identify Card, Badge, Button)
 * - Layout structure: 90%+ (should identify grid, spacing)
 * - Color families: 85%+ (should distinguish red vs amber vs green)
 * - Exact font sizes: 60% (often guesses 12-14px instead of 10-11px)
 * - Exact padding: 50% (confuses p-2, p-3, p-4)
 * - Medical semantics: 30% (doesn't understand STAT vs URGENT without context)
 */

export function AICalibrationTestSheet() {
  return (
    <div className="p-8 space-y-8 bg-background max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">UM Dashboard AI Calibration Test Sheet</h1>
        <p className="text-sm text-muted-foreground">
          Upload a screenshot of this page to AI and verify it can identify each element correctly.
          Compare AI responses to the documented values in comments.
        </p>
      </div>

      {/* Section 1: Typography Test */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Typography System Test</h2>
        <div className="space-y-3">
          
          {/* Label style - 10px */}
          <div className="flex items-baseline gap-4">
            <div className="w-32 text-xs text-muted-foreground">textStyles.label</div>
            <p className={textStyles.label}>
              This is 10px font with medium weight (font-medium leading-tight)
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded">text-[10px] font-medium</code>
          </div>

          {/* Body style - 11px */}
          <div className="flex items-baseline gap-4">
            <div className="w-32 text-xs text-muted-foreground">textStyles.body</div>
            <p className={textStyles.body}>
              This is 11px font with normal weight (leading-snug)
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded">text-[11px] leading-snug</code>
          </div>

          {/* Title style - 12px */}
          <div className="flex items-baseline gap-4">
            <div className="w-32 text-xs text-muted-foreground">textStyles.title</div>
            <p className={textStyles.title}>
              This is 12px font with semibold weight (font-semibold leading-tight)
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded">text-[12px] font-semibold</code>
          </div>

          {/* Section header style - 11px uppercase */}
          <div className="flex items-baseline gap-4">
            <div className="w-32 text-xs text-muted-foreground">textStyles.sectionHeader</div>
            <p className={textStyles.sectionHeader}>
              Section Header Style
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded">text-[11px] uppercase tracking-wide</code>
          </div>

          <div className="mt-4 p-3 bg-[var(--status-warn-bg)] border border-amber-200 rounded">
            <p className="text-xs font-medium text-amber-900">⚠️ AI Test Question:</p>
            <p className="text-xs text-amber-800 mt-1">
              "What are the exact pixel sizes of each text style above? (provide numbers, not Tailwind classes)"
            </p>
            <p className="text-xs text-amber-700 mt-2">
              <strong>Expected Answer:</strong> 10px, 11px, 12px, 11px (uppercase)
            </p>
          </div>
        </div>
      </Card>

      {/* Section 2: Color & Status Badge Test */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Status Badge Color Test</h2>
        
        <div className="space-y-6">
          
          {/* Urgency badges */}
          <div>
            <p className="text-sm font-medium mb-3">Urgency Levels (Medical Priority)</p>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <Badge className={statusBadgeStyles.STAT}>STAT</Badge>
                <p className="text-[10px] text-muted-foreground">Red/Destructive</p>
              </div>
              <div className="space-y-1">
                <Badge className={statusBadgeStyles.URGENT}>URGENT</Badge>
                <p className="text-[10px] text-muted-foreground">Amber/Warning</p>
              </div>
              <div className="space-y-1">
                <Badge className={statusBadgeStyles.ROUTINE}>ROUTINE</Badge>
                <p className="text-[10px] text-muted-foreground">Neutral/Muted</p>
              </div>
            </div>
          </div>

          {/* Workflow status badges */}
          <div>
            <p className="text-sm font-medium mb-3">Workflow Status</p>
            <div className="flex flex-wrap gap-3">
              <Badge className={statusBadgeStyles.PENDING_REVIEW}>Pending Review</Badge>
              <Badge className={statusBadgeStyles.IN_REVIEW}>In Review</Badge>
              <Badge className={statusBadgeStyles.APPROVED}>Approved</Badge>
              <Badge className={statusBadgeStyles.DENIED}>Denied</Badge>
              <Badge className={statusBadgeStyles.MORE_INFO_NEEDED}>More Info Needed</Badge>
            </div>
          </div>

          {/* AI confidence badges */}
          <div>
            <p className="text-sm font-medium mb-3">AI Confidence Levels</p>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <Badge className={confidenceStyles.high}>High Confidence</Badge>
                <p className="text-[10px] text-muted-foreground">Blue/Primary</p>
              </div>
              <div className="space-y-1">
                <Badge className={confidenceStyles.medium}>Medium Confidence</Badge>
                <p className="text-[10px] text-muted-foreground">Amber/Warning</p>
              </div>
              <div className="space-y-1">
                <Badge className={confidenceStyles.low}>Low Confidence</Badge>
                <p className="text-[10px] text-muted-foreground">Neutral/Muted</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[var(--status-warn-bg)] border border-amber-200 rounded">
            <p className="text-xs font-medium text-amber-900">⚠️ AI Test Question:</p>
            <p className="text-xs text-amber-800 mt-1">
              "What color is the STAT badge? What about URGENT? Should PENDING_REVIEW be purple?"
            </p>
            <p className="text-xs text-amber-700 mt-2">
              <strong>Expected Answer:</strong> STAT is red/destructive, URGENT is amber/warning, 
              PENDING_REVIEW is amber (NOT purple - we never use purple for medical status)
            </p>
          </div>
        </div>
      </Card>

      {/* Section 3: Spacing & Padding Test */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Spacing & Padding Test</h2>
        
        <div className="space-y-4">
          
          {/* p-2 padding example */}
          <div className="border-2 border-blue-500 inline-block">
            <div className="p-2 bg-blue-100">
              <p className={textStyles.body}>This box has p-2 padding (0.5rem = 8px)</p>
            </div>
          </div>

          {/* p-3 padding example - THIS IS THE STANDARD */}
          <div className="border-2 border-green-500 inline-block">
            <div className="p-3 bg-green-100">
              <p className={textStyles.body}>This box has p-3 padding (0.75rem = 12px) ← STANDARD FOR CARDS</p>
            </div>
          </div>

          {/* p-4 padding example */}
          <div className="border-2 border-amber-500 inline-block">
            <div className="p-4 bg-amber-100">
              <p className={textStyles.body}>This box has p-4 padding (1rem = 16px) - Use for larger sections only</p>
            </div>
          </div>

          {/* p-6 padding example - TOO LARGE */}
          <div className="border-2 border-red-500 inline-block">
            <div className="p-6 bg-red-100">
              <p className={textStyles.body}>This box has p-6 padding (1.5rem = 24px) - TOO LARGE, DO NOT USE</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[var(--status-warn-bg)] border border-amber-200 rounded">
            <p className="text-xs font-medium text-amber-900">⚠️ AI Test Question:</p>
            <p className="text-xs text-amber-800 mt-1">
              "Which padding value is standard for PatientObjectCard components?"
            </p>
            <p className="text-xs text-amber-700 mt-2">
              <strong>Expected Answer:</strong> p-3 (green box). p-6 should never be used.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 4: Component Pattern Test */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Component Structure Test</h2>
        
        {/* Mini PatientObjectCard replica */}
        <div className="max-w-2xl">
          <p className="text-sm font-medium mb-3">PatientObjectCard Pattern (DO NOT MODIFY)</p>
          
          <Card className="p-3 hover:bg-accent/50 transition-colors border-l-4 border-l-destructive">
            {/* Row 1: Header with badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className={textStyles.title}>Sarah Johnson</h3>
                <p className={textStyles.label + " text-muted-foreground"}>MRN: 12345678</p>
              </div>
              <div className="flex gap-1">
                <Badge className={statusBadgeStyles.STAT}>STAT</Badge>
                <Badge className={statusBadgeStyles.PENDING_REVIEW}>Pending</Badge>
              </div>
            </div>
            
            {/* Row 2: Clinical info */}
            <div className={textStyles.body + " space-y-1 mb-2"}>
              <p>Acute myocardial infarction</p>
              <p className="text-muted-foreground">Requested: Cardiac catheterization</p>
            </div>
            
            {/* Row 3: Footer metadata */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Submitted 2 days ago</span>
              <span className="text-destructive font-medium">Due today</span>
            </div>
          </Card>

          <div className="mt-4 p-3 bg-[var(--status-warn-bg)] border border-amber-200 rounded">
            <p className="text-xs font-medium text-amber-900">⚠️ AI Test Questions:</p>
            <ul className="text-xs text-amber-800 mt-1 space-y-1 ml-4 list-disc">
              <li>What is the padding on this card?</li>
              <li>What is the left border color indicating?</li>
              <li>How many rows of information are there?</li>
              <li>What font size is "Sarah Johnson"?</li>
              <li>What font size is "MRN: 12345678"?</li>
            </ul>
            <p className="text-xs text-amber-700 mt-2">
              <strong>Expected Answers:</strong> p-3 padding, Red left border (STAT urgency), 
              3 rows, 12px title, 10px label
            </p>
          </div>
        </div>
      </Card>

      {/* Section 5: Role-Based Actions Test */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Role-Based Actions Test</h2>
        
        <div className="space-y-6">
          
          {/* Case Manager actions */}
          <div>
            <p className="text-sm font-medium mb-3">Case Manager Role</p>
            <div className="flex gap-2 flex-wrap">
              <Button>Claim Case</Button>
              <Button variant="outline">Request Info</Button>
              <Button variant="outline">Send to Physician</Button>
            </div>
            <p className={textStyles.label + " text-muted-foreground mt-2"}>
              ✅ Should see: Claim, Request Info, Send to Physician
            </p>
          </div>

          {/* Physician actions */}
          <div>
            <p className="text-sm font-medium mb-3">Physician Role</p>
            <div className="flex gap-2 flex-wrap">
              <Button>Review & Approve</Button>
              <Button variant="outline">Request Additional Info</Button>
              <Button variant="destructive">Deny Request</Button>
            </div>
            <p className={textStyles.label + " text-muted-foreground mt-2"}>
              ✅ Should see: Review & Approve, Request Info, Deny
            </p>
            <p className={textStyles.label + " text-destructive mt-1"}>
              ❌ Should NOT see: "Claim Case" button (case manager only)
            </p>
          </div>

          {/* Auditor actions */}
          <div>
            <p className="text-sm font-medium mb-3">Auditor Role</p>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline">Flag for Review</Button>
              <Button variant="outline">Add Audit Note</Button>
            </div>
            <p className={textStyles.label + " text-muted-foreground mt-2"}>
              ✅ Should see: Flag, Add Note
            </p>
            <p className={textStyles.label + " text-destructive mt-1"}>
              ❌ Should NOT see: "Claim Case" or "Approve" buttons
            </p>
          </div>

          <div className="mt-4 p-3 bg-[var(--status-warn-bg)] border border-amber-200 rounded">
            <p className="text-xs font-medium text-amber-900">⚠️ AI Test Question:</p>
            <p className="text-xs text-amber-800 mt-1">
              "Should a physician be able to see the 'Claim Case' button?"
            </p>
            <p className="text-xs text-amber-700 mt-2">
              <strong>Expected Answer:</strong> No - "Claim Case" is case_manager role only. 
              Use conditional rendering, not disabled state.
            </p>
          </div>
        </div>
      </Card>

      {/* Section 6: Common Hallucination Detector */}
      <Card className="p-6 space-y-4 border-2 border-destructive">
        <h2 className="text-lg font-semibold border-b pb-2">❌ Common AI Mistakes to Watch For</h2>
        
        <div className="space-y-4">
          
          {/* Hallucination 1: Font size normalization */}
          <div className="p-3 bg-[var(--status-error-bg)] rounded">
            <p className="text-sm font-semibold text-red-900 mb-2">Mistake #1: Font Size Normalization</p>
            <div className="flex gap-4 items-baseline">
              <div>
                <p className="text-xs text-red-700 mb-1">❌ AI often generates:</p>
                <code className="text-xs bg-red-100 px-2 py-1 rounded">text-sm</code>
                <span className="text-xs text-[var(--destructive)] ml-2">(14px - too large)</span>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">✅ Should be:</p>
                <code className="text-xs bg-green-100 px-2 py-1 rounded">text-[11px]</code>
                <span className="text-xs text-green-600 ml-2">(exact pixel value)</span>
              </div>
            </div>
          </div>

          {/* Hallucination 2: Purple badges */}
          <div className="p-3 bg-[var(--status-error-bg)] rounded">
            <p className="text-sm font-semibold text-red-900 mb-2">Mistake #2: Adding Purple/Violet Status Colors</p>
            <div className="flex gap-4 items-center">
              <div>
                <p className="text-xs text-red-700 mb-1">❌ AI often creates:</p>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">Pending</Badge>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">✅ Should use:</p>
                <Badge className={statusBadgeStyles.PENDING_REVIEW}>Pending Review</Badge>
                <span className="text-xs text-green-600 ml-2">(amber from design system)</span>
              </div>
            </div>
          </div>

          {/* Hallucination 3: Duplicate actions */}
          <div className="p-3 bg-[var(--status-error-bg)] rounded">
            <p className="text-sm font-semibold text-red-900 mb-2">Mistake #3: Duplicate Action Buttons</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-red-700 mb-1">❌ AI often adds:</p>
                <div className="flex gap-2">
                  <Button size="sm">Claim Case</Button>
                  <span className="text-xs text-[var(--destructive)] self-center">← In card</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm">Claim Case</Button>
                  <span className="text-xs text-[var(--destructive)] self-center">← In WorkflowBar</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">✅ Should only appear:</p>
                <Button size="sm">Claim Case</Button>
                <span className="text-xs text-green-600 ml-2">← Once in WorkflowBar only</span>
              </div>
            </div>
          </div>

          {/* Hallucination 4: Excessive padding */}
          <div className="p-3 bg-[var(--status-error-bg)] rounded">
            <p className="text-sm font-semibold text-red-900 mb-2">Mistake #4: Adding Excessive Whitespace</p>
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-red-700 mb-1">❌ AI often uses:</p>
                <code className="text-xs bg-red-100 px-2 py-1 rounded">p-6 space-y-6</code>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">✅ Should use:</p>
                <code className="text-xs bg-green-100 px-2 py-1 rounded">p-3 space-y-2</code>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Final instructions */}
      <Card className="p-6 bg-[var(--status-info-bg)] border-blue-200">
        <h2 className="text-lg font-semibold mb-3">📸 How to Use This Calibration Sheet</h2>
        <ol className="space-y-2 text-sm ml-4 list-decimal">
          <li>Take a screenshot of this entire page</li>
          <li>Upload to your AI coding assistant (Claude, GPT-4, v0, etc.)</li>
          <li>Ask: "Please identify the font sizes, colors, padding values, and components you see in this screenshot"</li>
          <li>Compare AI response to the documented values in yellow warning boxes</li>
          <li>
            For any elements AI misidentifies (especially font sizes 10-12px, p-3 padding, status colors):
            <ul className="ml-6 mt-1 space-y-1 list-disc">
              <li>Explicitly provide the exact code from design-system.ts</li>
              <li>Do NOT rely on AI to generate these values</li>
              <li>Use find-and-replace or direct code snippets</li>
            </ul>
          </li>
          <li>Reference the "Common AI Mistakes" section when reviewing generated code</li>
        </ol>
      </Card>

    </div>
  )
}

/**
 * CALIBRATION RESULTS TEMPLATE
 * 
 * After testing your AI, document results here:
 * 
 * AI Model: _________________
 * Date: _________________
 * 
 * Typography Recognition:
 * - Correctly identified 10px font: YES / NO
 * - Correctly identified 11px font: YES / NO  
 * - Correctly identified 12px font: YES / NO
 * 
 * Color Recognition:
 * - Correctly identified STAT as red: YES / NO
 * - Correctly identified URGENT as amber: YES / NO
 * - Avoided using purple for status: YES / NO
 * 
 * Spacing Recognition:
 * - Correctly identified p-3 padding: YES / NO
 * - Avoided suggesting p-6: YES / NO
 * 
 * Component Recognition:
 * - Identified PatientObjectCard structure: YES / NO
 * - Understood role-based rendering: YES / NO
 * 
 * Overall Accuracy: ____%
 * 
 * Elements requiring explicit code (can't rely on AI generation):
 * - [ ] Font sizes
 * - [ ] Padding values
 * - [ ] Status badge mappings
 * - [ ] Role-based conditional rendering
 * - [ ] Other: _________________
 */
